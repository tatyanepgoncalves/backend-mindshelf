import {
  and,
  countDistinct,
  desc,
  eq,
  ilike,
  isNull,
  type SQL,
} from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatDate, formatPhone, formatRelativeTime } from '../../lib/utils.js'
import type { GetReservationsByUserQuerySchema } from '../../schemas/reservations/getReservationsByUserSchema.js'

export class GetReservationsByUserService {
  async execute(userId: string, query: GetReservationsByUserQuerySchema) {
    const { title, status, page, limit } = query
    const offset = (page - 1) * limit

    const conditions: SQL[] = [
      eq(schema.reservations.readerId, userId),
      isNull(schema.reservations.deletedAt),
    ]

    if (status) {
      conditions.push(eq(schema.reservations.status, status))
    }

    if (title) {
      conditions.push(ilike(schema.books.title, `%${title}%`))
    }

    const whereClause = and(...conditions)

    const [totalResult] = await db
      .select({ total: countDistinct(schema.reservations.id) })
      .from(schema.reservations)
      .innerJoin(schema.books, eq(schema.reservations.bookId, schema.books.id))
      .where(whereClause)

    const total = totalResult?.total ?? 0

    if (total === 0) {
      return {
        message: 'Reservas recuperadas com sucesso.',
        pagination: { limit, page, total: 0, totalPages: 1 },
        reservations: [],
      }
    }

    const rows = await db.query.reservations.findMany({
      limit,
      offset,
      orderBy: desc(schema.reservations.createdAt),
      where: whereClause,
      with: {
        book: true,
        reader: true,
      },
    })

    const formattedReservations = rows.map((item) => ({
      book: {
        author: item.book.author,
        coverUrl: item.book.coverUrl ?? null,
        id: item.book.id,
        isbn: item.book.isbn ?? null,
        locationLibrary: item.book.locationLibrary ?? null,
        publisher: item.book.publisher ?? null,
        synopsis: item.book.synopsis ?? null,
        title: item.book.title,
      },
      createdAt: formatRelativeTime(item.createdAt ?? new Date()),
      id: item.id,
      reader: {
        contact: {
          address: item.reader.address ?? null,
          email: item.reader.email,
          phone: item.reader.phone ? formatPhone(item.reader.phone) : null,
        },
        id: item.reader.id,
        name: item.reader.name,
      },
      reservationDate: item.reservationDate
        ? formatDate(item.reservationDate, true)
        : null,
      status: item.status,
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
