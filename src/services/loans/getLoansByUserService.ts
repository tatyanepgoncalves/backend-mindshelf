import { and, count, desc, eq, ilike, isNull, sql } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { GetLoansByUserQuerySchema } from '../../schemas/loans/getLoansByUserSchema.js'

export class GetLoansByUserService {
  async execute(userId: string, query: GetLoansByUserQuerySchema) {
    const { title, status, mes, page, limit } = query
    const offset = (page - 1) * limit

    const conditions = [
      eq(schema.loans.readerId, userId),
      isNull(schema.loans.deletedAt),
      isNull(schema.loansItems.deletedAt),
    ]

    if (status) {
      conditions.push(eq(schema.loansItems.status, status))
    }

    if (title) {
      conditions.push(ilike(schema.books.title, `%${title}%`))
    }

    if (mes) {
      const month = Number(mes)

      if (month >= 1 && month <= 12) {
        conditions.push(
          sql`EXTRACT(MONTH FROM ${schema.loans.createdAt}) = ${month}`
        )
      }
    }

    const whereClause = and(...conditions)

    const [totalResult] = await db
      .select({ total: count() })
      .from(schema.loans)
      .innerJoin(
        schema.loansItems,
        eq(schema.loansItems.loanId, schema.loans.id)
      )
      .innerJoin(schema.books, eq(schema.books.id, schema.loansItems.bookId))
      .where(whereClause)

    const total = Number(totalResult?.total ?? 0)

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
        id: schema.loansItems.id,
        loanDate: schema.loans.createdAt,
        returnDate: schema.loansItems.returnDate,
        status: schema.loansItems.status,
      })
      .from(schema.loans)
      .innerJoin(
        schema.loansItems,
        eq(schema.loansItems.loanId, schema.loans.id)
      )
      .innerJoin(schema.books, eq(schema.books.id, schema.loansItems.bookId))
      .where(whereClause)
      .orderBy(desc(schema.loans.createdAt))
      .limit(limit)
      .offset(offset)

    const loans = rows.map((loan) => ({
      book: loan.book,
      createdAt: formatRelativeTime(loan.createdAt),
      dueDate: formatRelativeTime(loan.dueDate),
      id: loan.id,
      loanDate: formatRelativeTime(loan.loanDate),
      renewalsCount: 0,
      returnDate: loan.returnDate ? formatRelativeTime(loan.returnDate) : null,
      status: loan.status,
    }))

    return {
      loans,
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
