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
    const { readerId, items } = data

    // Evita duplicidade de livros na própria requisição
    const bookIdsInRequest = items.map((item) => item.bookId)
    if (new Set(bookIdsInRequest).size !== bookIdsInRequest.length) {
      throw new DuplicateBooksInRequestError()
    }

    return await db.transaction(async (tx) => {
      // Verifica se o leitor existe
      const existingReader = await tx.query.users.findFirst({
        where: and(
          eq(schema.users.id, readerId),
          isNull(schema.users.deletedAt)
        ),
      })

      if (!existingReader) {
        throw new ReaderNotFoundError()
      }

      // Busca os empréstimos ativos atuais do leitor
      const activeLoansCount = await tx.query.loans.findMany({
        where: and(
          eq(schema.loans.readerId, readerId),
          eq(schema.loans.status, 'ATIVO'),
          isNull(schema.loans.deletedAt)
        ),
      })

      if (activeLoansCount.length + items.length > 3) {
        throw new MaxLoansExceededError(activeLoansCount.length, items.length)
      }

      // Busca todos os livros solicitados
      const books = await tx.query.books.findMany({
        where: and(
          inArray(schema.books.id, bookIdsInRequest),
          isNull(schema.books.deletedAt)
        ),
      })

      if (books.length !== items.length) {
        throw new BookNotFoundError()
      }

      // Verifica se algum dos livros já possui empréstimo ATIVO
      const activeBookLoans = await tx.query.loans.findMany({
        where: and(
          inArray(schema.loans.bookId, bookIdsInRequest),
          eq(schema.loans.status, 'ATIVO'),
          isNull(schema.loans.deletedAt)
        ),
        with: {
          book: true,
        },
      })

      if (activeBookLoans.length > 0) {
        const loanedBookTitle = activeBookLoans[0].book.title
        throw new BookAlreadyLoanedError(loanedBookTitle)
      }

      // Prepara os registros com prazos de vencimento individuais
      const loansToInsert = items.map((item) => {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + item.dueDays)

        return {
          bookId: item.bookId,
          dueDate,
          readerId,
          status: 'ATIVO' as const,
        }
      })

      const insertedLoans = await tx
        .insert(schema.loans)
        .values(loansToInsert)
        .returning()

      // Mapeia para corresponder ao retorno e formata as datas em dd/mm/yyyy
      const formattedLoans = insertedLoans.map((loan) => {
        // biome-ignore lint/style/noNonNullAssertion: it's necessary
        const book = books.find((b) => b.id === loan.bookId)!

        return {
          book: {
            author: book.author,
            id: book.id,
            title: book.title,
          },
          createdAt: loan.createdAt
            ? formatRelativeTime(loan.createdAt)
            : loan.createdAt,
          deletedAt: loan.deletedAt ? formatRelativeTime(loan.deletedAt) : null,
          dueDate: loan.dueDate.toISOString(),
          id: loan.id,
          reader: {
            id: existingReader.id,
            name: existingReader.name,
          },
          returnDate: loan.returnDate
            ? formatRelativeTime(loan.returnDate)
            : null,
          status: loan.status,
          updatedAt: loan.updatedAt ? formatRelativeTime(loan.updatedAt) : null,
        }
      })

      return {
        loans: formattedLoans,
        message: `Empréstimo de ${items.length} livro(s) realizado com sucesso para ${existingReader.name}!`,
      }
    })
  }
}
