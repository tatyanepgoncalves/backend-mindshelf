import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatPhone, formatRelativeTime } from '../../lib/utils.js'
import type { CreateReservationBodySchema } from '../../schemas/reservations/createReservationSchema.js'

export class ReaderNotFoundError extends Error {
  constructor() {
    super('Leitor não encontrado.')
  }
}

export class BookNotFoundError extends Error {
  constructor() {
    super('Livro não encontrado.')
  }
}

export class BookAlreadyReservedError extends Error {
  constructor() {
    super('Este leitor já possui uma reserva ativa para este mesmo livro.')
  }
}

export class CreateReservationService {
  async execute(data: CreateReservationBodySchema) {
    const { readerId, bookId, reservationDate } = data

    // Verifica leitor existente
    const existingReader = await db.query.users.findFirst({
      where: and(eq(schema.users.id, readerId), isNull(schema.users.deletedAt)),
    })

    if (!existingReader) {
      throw new ReaderNotFoundError()
    }

    // Verifica livro existente
    const existingBook = await db.query.books.findFirst({
      where: and(eq(schema.books.id, bookId), isNull(schema.books.deletedAt)),
    })

    if (!existingBook) {
      throw new BookNotFoundError()
    }

    // Verifica reserva pendente ou ativa
    const activeReservation = await db.query.reservations.findFirst({
      where: and(
        eq(schema.reservations.readerId, readerId),
        eq(schema.reservations.bookId, bookId),
        inArray(schema.reservations.status, ['PENDENTE', 'NOTIFICADO']),
        isNull(schema.reservations.deletedAt)
      ),
    })

    if (activeReservation) {
      throw new BookAlreadyReservedError()
    }

    // Insere a reserva utilizando createdAt (padrão) e reservationDate se fornecido
    const [newReservation] = await db
      .insert(schema.reservations)
      .values({
        bookId,
        readerId,
        reservationDate: reservationDate ? new Date(reservationDate) : null,
        status: 'PENDENTE',
      })
      .returning()

    return {
      message: `Reserva do livro "${existingBook.title}" realizada com sucesso.`,
      reservation: {
        book: {
          author: existingBook.author,
          coverUrl: existingBook.coverUrl ?? null,
          id: existingBook.id,
          isbn: existingBook.isbn ?? undefined,
          locationLibrary: existingBook.locationLibrary ?? null,
          publisher: existingBook.publisher ?? '',
          synopsis: existingBook.synopsis ?? null,
          title: existingBook.title,
        },
        createdAt: formatRelativeTime(newReservation.createdAt ?? new Date()),
        id: newReservation.id,
        reader: {
          contact: {
            address: existingReader.address ?? undefined,
            email: existingReader.email,
            phone: existingReader.phone
              ? formatPhone(existingReader.phone)
              : undefined,
          },
          id: existingReader.id,
          name: existingReader.name,
        },
        reservationDate: newReservation.reservationDate
          ? formatRelativeTime(newReservation.reservationDate)
          : null,
        status: newReservation.status,
      },
    }
  }
}
