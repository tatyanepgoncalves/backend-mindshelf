import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'

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
          with: {
            book: true,
          },
        },
        reservations: {
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
    const readerLoansFormatted = reader.loans.map((loan) => ({
      book: {
        author: loan.book.author,
        id: loan.book.id,
        slug: loan.book.slug,
        title: loan.book.title,
      },
      createdAt: loan.createdAt,
      deletedAt: loan.deletedAt ? formatRelativeTime(loan.deletedAt) : null,
      dueDate: loan.dueDate,
      id: loan.id,
      returnDate: loan.returnDate ? formatRelativeTime(loan.returnDate) : null,
      status: loan.status,
      updatedAt: loan.updatedAt ? formatRelativeTime(loan.updatedAt) : null,
    }))

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
          : reservation.createdAt,
        deletedAt: reservation.deletedAt
          ? formatRelativeTime(reservation.deletedAt)
          : null,
        id: reservation.id,
        reservationDate: reservation.reservationDate
          ? formatRelativeTime(reservation.reservationDate)
          : null,
        reservedDate: reservation.reservedAt
          ? formatRelativeTime(reservation.reservedAt)
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
