import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'

export class GetLoansByUserService {
  async execute(userId: string) {
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
      .where(
        and(
          eq(schema.loans.readerId, userId),
          isNull(schema.loans.deletedAt),
          isNull(schema.loansItems.deletedAt)
        )
      )
      .orderBy(desc(schema.loans.createdAt))

    return {
      loans: rows.map((loan) => ({
        book: loan.book,
        createdAt: formatRelativeTime(loan.createdAt),
        dueDate: formatRelativeTime(loan.dueDate),
        id: loan.id,
        loanDate: formatRelativeTime(loan.loanDate),
        renewalsCount: 0,
        returnDate: loan.returnDate
          ? formatRelativeTime(loan.returnDate)
          : null,
        status: loan.status,
      })),
      message: 'Empréstimos recuperados com sucesso.',
    }
  }
}
