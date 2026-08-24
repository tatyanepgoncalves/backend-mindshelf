import { and, desc, eq, type SQL, sql } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { GetLoansQuerySchema } from '../../schemas/loans/getLoansSchema.js'

export class LoansNotFoundError extends Error {
  constructor() {
    super('Nenhum empréstimo encontrado com os critérios especificados.')
  }
}

export class GetLoansService {
  async execute(query: GetLoansQuerySchema) {
    const { readerId, bookId, status, mes } = query

    const conditions: SQL[] = []

    if (readerId) {
      conditions.push(eq(schema.loans.readerId, readerId))
    }

    if (bookId) {
      conditions.push(eq(schema.loans.bookId, bookId))
    }

    if (status) {
      conditions.push(eq(schema.loans.status, status))
    }

    if (mes) {
      const monthNumber = Number(mes)
      if (!Number.isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
        // Filtra pelo mês de criação (EXTRACT MONTH no PostgreSQL)
        conditions.push(
          sql`EXTRACT(MONTH FROM ${schema.loans.createdAt}) = ${monthNumber}`
        )
      }
    }

    // Busca os empréstimos com os relacionamentos de leitor e livro
    const loans = await db.query.loans.findMany({
      orderBy: desc(schema.loans.createdAt),
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        book: {
          columns: {
            author: true,
            id: true,
            slug: true,
            title: true,
          },
        },
        reader: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!loans) {
      throw new LoansNotFoundError()
    }

    const isEmpty = loans.length === 0

    return {
      loans: loans.map((loan) => ({
        book: {
          author: loan.book.author,
          id: loan.book.id,
          slug: loan.book.slug,
          title: loan.book.title,
        },
        createdAt: loan.createdAt
          ? formatRelativeTime(loan.createdAt)
          : loan.createdAt,
        deletedAt: loan.deletedAt ? formatRelativeTime(loan.deletedAt) : null,
        dueDate: loan.dueDate ? formatRelativeTime(loan.dueDate) : loan.dueDate,
        id: loan.id,
        reader: {
          id: loan.reader.id,
          name: loan.reader.name,
        },
        returnDate: loan.returnDate
          ? formatRelativeTime(loan.returnDate)
          : null,
        status: loan.status,
        updatedAt: loan.updatedAt ? formatRelativeTime(loan.updatedAt) : null,
      })),
      message: isEmpty
        ? 'Nenhum empréstimo encontrado.'
        : 'Empréstimos recuperados com sucesso.',
    }
  }
}
