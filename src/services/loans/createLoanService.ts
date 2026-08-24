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

      // Busca empréstimos ativos atuais
      const activeLoansCount = await tx.query.loans.findMany({
        where: and(
          eq(schema.loans.readerId, readerId),
          eq(schema.loans.status, 'ATIVO'),
          isNull(schema.loans.deletedAt)
        ),
      })

      if (activeLoansCount.length + requestedBooks.length > 3) {
        throw new MaxLoansExceededError(
          activeLoansCount.length,
          requestedBooks.length
        )
      }

      // Busca livros
      const booksFromDb = await tx.query.books.findMany({
        where: and(
          inArray(schema.books.id, bookIdsInRequest),
          isNull(schema.books.deletedAt)
        ),
      })

      if (booksFromDb.length !== requestedBooks.length) {
        throw new BookNotFoundError()
      }

      // Verifica conflito de empréstimo ativo
      const activeBookLoans = await tx.query.loans.findMany({
        where: and(
          inArray(schema.loans.bookId, bookIdsInRequest),
          eq(schema.loans.status, 'ATIVO'),
          isNull(schema.loans.deletedAt)
        ),
        with: { book: true },
      })

      if (activeBookLoans.length > 0) {
        const loanedBookTitle = activeBookLoans[0].book.title
        throw new BookAlreadyLoanedError(loanedBookTitle)
      }

      // Prepara as inserções calculando a data retroativa (se enviada)
      const loansToInsert = requestedBooks.map((item) => {
        const startDate = item.issuedAt ? new Date(item.issuedAt) : new Date()

        const dueDate = new Date(startDate)
        dueDate.setDate(dueDate.getDate() + item.dueDays)

        return {
          bookId: item.bookId,
          createdAt: startDate, // Define a data da criação no passado se informada
          dueDate,
          readerId,
          status: 'ATIVO' as const,
        }
      })

      const insertedLoans = await tx
        .insert(schema.loans)
        .values(loansToInsert)
        .returning()

      const formattedLoans = insertedLoans.map((loan) => {
        // biome-ignore lint/style/noNonNullAssertion: it's necessary
        const book = booksFromDb.find((b) => b.id === loan.bookId)!

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
          dueDate: loan.dueDate
            ? formatRelativeTime(loan.dueDate)
            : loan.dueDate,
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
        message: `Empréstimo de ${requestedBooks.length} livro(s) cadastrado com sucesso!`,
      }
    })
  }
}
