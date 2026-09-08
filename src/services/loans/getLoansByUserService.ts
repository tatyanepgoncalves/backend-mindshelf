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

    // Contagem total ajustando os JOINs com loansItems
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

    // Busca relacional paginada
    const rows = await db.query.loans.findMany({
      limit,
      offset,
      orderBy: desc(schema.loans.createdAt),
      where: whereClause,
      with: {
        items: {
          with: {
            book: true,
          },
        },
      },
    })

    const formattedLoans = rows.flatMap((loan) =>
      loan.items.map((item) => ({
        book: {
          author: item.book.author,
          coverUrl: item.book.coverUrl,
          id: item.book.id,
          isbn: item.book.isbn,
          title: item.book.title,
        },
        createdAt: item.createdAt
          ? formatRelativeTime(item.createdAt)
          : item.createdAt,
        dueDate: item.dueDate ? formatRelativeTime(item.dueDate) : null,
        id: item.id,
        returnDate: item.returnDate
          ? formatRelativeTime(item.returnDate)
          : null,
        status: item.status,
        updatedAt: item.updatedAt
          ? formatRelativeTime(item.updatedAt)
          : item.updatedAt,
      }))
    )

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
