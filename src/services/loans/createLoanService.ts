import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { CreateLoanBodySchema } from '../../schemas/loans/createLoanSchema.js'

export class ReaderNotFoundError extends Error {
  constructor() {
    super('Leitor não encontrado.')
  }
}

export class BookNotFoundError extends Error {
  constructor() {
    super('Um ou mais livros informados não foram encontrados.')
  }
}

export class BookAlreadyLoanedError extends Error {
  constructor(bookTitle?: string) {
    super(
      bookTitle
        ? `O livro "${bookTitle}" já possui um empréstimo ativo no momento.`
        : 'Um ou mais livros já possuem um empréstimo ativo no momento.'
    )
  }
}

export class MaxLoansExceededError extends Error {
  constructor(currentCount: number, requestedCount: number) {
    super(
      `O leitor possui ${currentCount} empréstimo(s) ativo(s). Solicitar mais ${requestedCount} ultrapassa o limite máximo de 3.`
    )
  }
}

export class DuplicateBooksInRequestError extends Error {
  constructor() {
    super(
      'Não é permitido incluir o mesmo livro mais de uma vez no mesmo empréstimo.'
    )
  }
}

export class CreateLoanService {
  async execute(data: CreateLoanBodySchema) {
    const { readerId, books: requestedBooks } = data
    const bookIdsInRequest = requestedBooks.map((item) => item.bookId)

    return await db.transaction(async (tx) => {
      // Verifica Leitor
      const existingReader = await tx.query.users.findFirst({
        where: and(
          eq(schema.users.id, readerId),
          isNull(schema.users.deletedAt)
        ),
      })
      if (!existingReader) {
        throw new Error('Leitor não encontrado.')
      }

      // Conta empréstimos ativos em `loanItems`
      const activeItems = await tx.query.loansItems.findMany({
        where: and(
          eq(schema.loansItems.status, 'ATIVO'),
          isNull(schema.loansItems.deletedAt)
        ),
        with: { loan: true },
      })

      const readerActiveCount = activeItems.filter(
        (item) => item.loan.readerId === readerId
      ).length

      if (readerActiveCount + requestedBooks.length > 3) {
        throw new Error(
          `Limite excedido. O leitor já possui ${readerActiveCount} empréstimos ativos.`
        )
      }

      // Verifica conflito de livros já emprestados
      const activeBookLoans = await tx.query.loansItems.findMany({
        where: and(
          inArray(schema.loansItems.bookId, bookIdsInRequest),
          eq(schema.loansItems.status, 'ATIVO'),
          isNull(schema.loansItems.deletedAt)
        ),
      })
      if (activeBookLoans.length > 0) {
        throw new Error('Um ou mais livros já possuem empréstimos ativos.')
      }

      // Busca livros do banco
      const booksFromDb = await tx.query.books.findMany({
        where: and(
          inArray(schema.books.id, bookIdsInRequest),
          isNull(schema.books.deletedAt)
        ),
      })

      //  Cria 1 ÚNICO Registro de Loan (Cabeçalho)
      const [newLoan] = await tx
        .insert(schema.loans)
        .values({ readerId })
        .returning()

      // Prepara e insere os itens em `loanItems`
      const itemsToInsert = requestedBooks.map((item) => {
        const startDate = item.issuedAt ? new Date(item.issuedAt) : new Date()
        const dueDate = new Date(startDate)
        dueDate.setDate(dueDate.getDate() + item.dueDays)

        return {
          bookId: item.bookId,
          createdAt: startDate,
          dueDate,
          loanId: newLoan.id,
          status: 'ATIVO' as const,
        }
      })

      const insertedItems = await tx
        .insert(schema.loansItems)
        .values(itemsToInsert)
        .returning()

      // Formata a resposta agrupada
      return {
        loan: {
          createdAt: newLoan.createdAt.toISOString(),
          id: newLoan.id,
          items: insertedItems.map((item) => {
            // biome-ignore lint/style/noNonNullAssertion: it's necessarsy
            const book = booksFromDb.find((b) => b.id === item.bookId)!
            return {
              book: {
                author: book.author,
                id: book.id,
                title: book.title,
              },
              dueDate: item.dueDate
                ? formatRelativeTime(item.dueDate)
                : item.dueDate,
              id: item.id,
              returnDate: item.returnDate
                ? formatRelativeTime(item.returnDate)
                : null,
              status: item.status,
            }
          }),
          reader: {
            id: existingReader.id,
            name: existingReader.name,
          },
        },
        message: 'Empréstimo realizado com sucesso!',
      }
    })
  }
}
