import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatDate, formatRelativeTime } from '../../lib/utils.js'

export class SlugReaderNotFoundError extends Error {
  constructor() {
    super('Leitor não encontrado com base no slug fornecido.')
  }
}

export class GetReaderBySlugService {
  async execute(slug: string) {
    // Search reader by slug
    const reader = await db.query.users.findFirst({
      where: and(eq(schema.users.slug, slug), isNull(schema.users.deletedAt)),
      with: {
        loans: {
          where: isNull(schema.loans.deletedAt),
          with: {
            items: {
              where: isNull(schema.loansItems.deletedAt),
              with: {
                book: true,
              },
            },
          },
        },
        reservations: {
          where: isNull(schema.reservations.deletedAt),
          with: {
            book: true,
          },
        },
      },
    })

    if (!reader) {
      throw new SlugReaderNotFoundError()
    }

    const activeLoansCount = reader.loans.length
    const activeReservationCount = reader.reservations.length

    // Reader Info
    const readerFormatted = {
      address: reader.address,
      createdAt: reader.createdAt
        ? formatRelativeTime(reader.createdAt)
        : reader.createdAt,
      deletedAt: reader.deletedAt ? formatRelativeTime(reader.deletedAt) : null,
      email: reader.email,
      id: reader.id,
      name: reader.name,
      phone: reader.phone,
      summary: {
        activeLoansCount,
        activeReservationCount,
        hasActiveLoans: activeLoansCount > 0,
        hasActiveReservations: activeReservationCount > 0,
      },
      updatedAt: reader.updatedAt ? formatRelativeTime(reader.updatedAt) : null,
    }

    // Reader Loans
    const readerLoansFormatted = reader.loans.flatMap((loan) =>
      loan.items.map((item) => ({
        book: {
          author: item.book.author,
          id: item.book.id,
          slug: item.book.slug,
          title: item.book.title,
        },
        createdAt: formatRelativeTime(item.createdAt),
        deletedAt: item.deletedAt ? formatRelativeTime(item.deletedAt) : null,
        dueDate: item.dueDate ? formatDate(item.dueDate) : null,
        id: item.id,
        loanId: loan.id,
        returnDate: item.returnDate
          ? formatRelativeTime(item.returnDate)
          : null,
        status: item.status,
        updatedAt: item.updatedAt ? formatRelativeTime(item.updatedAt) : null,
      }))
    )

    // Reader reservations
    const readerReservationFormatted = reader.reservations.map(
      (reservation) => ({
        book: {
          author: reservation.book.author,
          id: reservation.book.id,
          slug: reservation.book.slug,
          title: reservation.book.title,
        },
        createdAt: reservation.createdAt
          ? formatRelativeTime(reservation.createdAt)
          : null,
        deletedAt: reservation.deletedAt
          ? formatRelativeTime(reservation.deletedAt)
          : null,
        id: reservation.id,
        reservationDate: reservation.reservationDate
          ? formatDate(reservation.reservationDate)
          : null,
        status: reservation.status,
        updatedAt: reservation.updatedAt
          ? formatRelativeTime(reservation.updatedAt)
          : null,
      })
    )

    return {
      loans: readerLoansFormatted,
      reader: readerFormatted,
      reservations: readerReservationFormatted,
    }
  }
}
