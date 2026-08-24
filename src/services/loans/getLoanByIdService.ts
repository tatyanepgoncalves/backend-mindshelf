import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'

export class LoanIdNotFoundError extends Error {
  constructor() {
    super('Nenhum empréstimo encontrado com o ID especificado.')
  }
}

export class GetLoanByIdService {
  async execute(loanId: string) {
    const loan = await db.query.loans.findFirst({
      where: eq(schema.loans.id, loanId),
      with: {
        book: true,
        reader: true,
      },
    })

    if (!loan) {
      throw new LoanIdNotFoundError()
    }

    return {
      loan: {
        book: {
          author: loan.book.author,
          coverUrl: loan.book.coverUrl,
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
          address: loan.reader.address,
          email: loan.reader.email,
          id: loan.reader.id,
          name: loan.reader.name,
          phone: loan.reader.phone,
          slug: loan.reader.slug,
        },
        returnDate: loan.returnDate
          ? formatRelativeTime(loan.returnDate)
          : null,
        status: loan.status,
        updatedAt: loan.updatedAt ? formatRelativeTime(loan.updatedAt) : null,
      },
    }
  }
}
