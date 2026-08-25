import { and, count, eq, ilike, isNull, type SQL } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatDate, formatPhone, formatRelativeTime } from '../../lib/utils.js'
import type { GetReservationsQuerySchema } from '../../schemas/reservations/getReservationsSchema.js'

export class ReservationsNotFoundError extends Error {
  constructor() {
    super('Nenhuma reserva encontrada com os filtros informados.')
  }
}

export class GetReservationsService {
  async execute(query: GetReservationsQuerySchema) {
    const { title, readerName, status, page, limit } = query
    const offset = (page - 1) * limit

    const conditions: SQL[] = [isNull(schema.reservations.deletedAt)]

    if (status) {
      conditions.push(eq(schema.reservations.status, status))
    }

    if (title) {
      conditions.push(ilike(schema.books.title, `%${title}%`))
    }

    if (readerName) {
      conditions.push(ilike(schema.users.name, `%${readerName}%`))
    }

    const whereClause = and(...conditions)

    // 1. Contagem total garantindo os JOINs corretos
    const [totalResult] = await db
      .select({ total: count() })
      .from(schema.reservations)
      .innerJoin(schema.books, eq(schema.reservations.bookId, schema.books.id))
      .innerJoin(
        schema.users,
        eq(schema.reservations.readerId, schema.users.id)
      )
      .where(whereClause)

    const total = totalResult?.total ?? 0

    if (total === 0) {
      throw new ReservationsNotFoundError()
    }

    // 2. Busca paginada referenciando corretamente as tabelas nos JOINs
    const rows = await db
      .select({
        book: schema.books,
        reader: schema.users,
        reservation: schema.reservations,
      })
      .from(schema.reservations)
      .innerJoin(schema.books, eq(schema.reservations.bookId, schema.books.id))
      .innerJoin(
        schema.users,
        eq(schema.reservations.readerId, schema.users.id)
      )
      .where(whereClause)
      .orderBy(schema.reservations.createdAt)
      .limit(limit)
      .offset(offset)

    const formattedReservations = rows.map(({ reservation, book, reader }) => ({
      book: {
        author: book.author,
        coverUrl: book.coverUrl ?? null,
        id: book.id,
        isbn: book.isbn ?? null,
        locationLibrary: book.locationLibrary ?? null,
        publisher: book.publisher ?? null,
        synopsis: book.synopsis ?? null,
        title: book.title,
      },
      createdAt: formatRelativeTime(reservation.createdAt ?? new Date()),
      id: reservation.id,
      reader: {
        contact: {
          address: reader.address ?? null,
          email: reader.email,
          phone: reader.phone ? formatPhone(reader.phone) : null,
        },
        id: reader.id,
        name: reader.name,
      },
      reservationDate: reservation.reservationDate
        ? formatDate(reservation.reservationDate, true)
        : null,
      status: reservation.status,
    }))

    return {
      message: 'Reservas recuperadas com sucesso.',
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      reservations: formattedReservations,
    }
  }
}
