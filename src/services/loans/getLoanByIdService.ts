import { and, eq, isNull } from 'drizzle-orm'
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
    // Busca loan pelo id
    const loan = await db.query.loans.findFirst({
      where: and(eq(schema.loans.id, loanId), isNull(schema.loans.deletedAt)),
      with: {
        items: {
          with: {
            book: true,
          },
        },
        reader: true,
      },
    })

    if (!loan) {
      throw new LoanIdNotFoundError()
    }

    return {
      loan: {
        createdAt: formatRelativeTime(loan.createdAt),
        deletedAt: loan.deletedAt ? formatRelativeTime(loan.deletedAt) : null,
        id: loan.id,
        items: loan.items.map((item) => ({
          book: {
            author: item.book.author,
            coverUrl: item.book.coverUrl,
            id: item.book.id,
            slug: item.book.slug,
            title: item.book.title,
          },
          dueDate: formatRelativeTime(item.dueDate),
          id: item.id,
          returnDate: item.returnDate
            ? formatRelativeTime(item.returnDate)
            : null,
          status: item.status,
        })),
        reader: {
          address: loan.reader.address,
          email: loan.reader.email,
          id: loan.reader.id,
          name: loan.reader.name,
          phone: loan.reader.phone,
          slug: loan.reader.slug,
        },
        updatedAt: loan.updatedAt ? formatRelativeTime(loan.updatedAt) : null,
      },
    }
  }
}
