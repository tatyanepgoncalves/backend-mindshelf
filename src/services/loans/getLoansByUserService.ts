import { and, count, desc, eq, ilike, isNull, type SQL, sql } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { GetLoansByUserQuerySchema } from '../../schemas/loans/getLoansByUserSchema.js'

export class GetLoansByUserService {
  async execute(userId: string, query: GetLoansByUserQuerySchema) {
    const { title, status, mes, page, limit } = query
    const offset = (page - 1) * limit

    const conditions: SQL[] = [
      eq(schema.loans.readerId, userId),
      isNull(schema.loans.deletedAt),
    ]

    if (status) {
      conditions.push(eq(schema.loansItems.status, status))
    }

    if (title) {
      conditions.push(ilike(schema.books.title, `%${title}%`))
    }

    if (mes) {
      const monthNumber = Number(mes)
      if (!Number.isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
        conditions.push(
          sql`EXTRACT(MONTH FROM ${schema.loans.createdAt}) = ${monthNumber}`
        )
      }
    }

    const whereClause = and(...conditions)

    const [totalResult] = await db
      .select({ total: count() })
      .from(schema.loans)
      .innerJoin(
        schema.loansItems,
        eq(schema.loans.id, schema.loansItems.loanId)
      )
      .innerJoin(schema.books, eq(schema.loansItems.bookId, schema.books.id))
      .where(whereClause)

    const total = totalResult?.total ?? 0

    if (total === 0) {
      return {
        loans: [],
        message: 'Empréstimos recuperados com sucesso.',
        pagination: {
          limit,
          page,
          total: 0,
          totalPages: 1,
        },
      }
    }

    const rows = await db
      .select({
        book: {
          author: schema.books.author,
          coverUrl: schema.books.coverUrl,
          id: schema.books.id,
          isbn: schema.books.isbn,
          title: schema.books.title,
        },
        createdAt: schema.loansItems.createdAt,
        dueDate: schema.loansItems.dueDate,
        itemId: schema.loansItems.id,
        returnDate: schema.loansItems.returnDate,
        status: schema.loansItems.status,
        updatedAt: schema.loansItems.updatedAt,
      })
      .from(schema.loans)
      .innerJoin(
        schema.loansItems,
        eq(schema.loans.id, schema.loansItems.loanId)
      )
      .innerJoin(schema.books, eq(schema.loansItems.bookId, schema.books.id))
      .where(whereClause)
      .orderBy(desc(schema.loans.createdAt))
      .limit(limit)
      .offset(offset)

    const formattedLoans = rows.map((item) => ({
      book: item.book,
      createdAt: item.createdAt ? formatRelativeTime(item.createdAt) : null,
      dueDate: item.dueDate ? formatRelativeTime(item.dueDate) : null,
      id: item.itemId,
      returnDate: item.returnDate ? formatRelativeTime(item.returnDate) : null,
      status: item.status,
      updatedAt: item.updatedAt ? formatRelativeTime(item.updatedAt) : null,
    }))

    return {
      loans: formattedLoans,
      message: 'Empréstimos recuperados com sucesso.',
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  }
}
