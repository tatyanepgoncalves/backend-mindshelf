import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatDate } from '../../lib/utils.js'
import type { ChangeReservationBookBodySchema } from '../../schemas/reservations/changeReservationBookSchema.js'

export class ReservationNotFoundError extends Error {
  constructor() {
    super('Reserva não encontrada.')
  }
}

export class BookNotFoundError extends Error {
  constructor() {
    super('O novo livro informado não foi encontrado.')
  }
}

export class BookAlreadyReservedError extends Error {
  constructor() {
    super(
      'Este leitor já possui uma reserva ativa para o novo livro informado.'
    )
  }
}

export class ChangeReservationBookService {
  async execute(reservationId: string, data: ChangeReservationBookBodySchema) {
    const { bookId, reservationDate } = data

    // Check if reservation exists
    const existingReservation = await db.query.reservations.findFirst({
      where: and(
        eq(schema.reservations.id, reservationId),
        isNull(schema.reservations.notifiedAt),
        isNull(schema.reservations.expiresAt),
        isNull(schema.reservations.deletedAt)
      ),
      with: {
        book: true,
      },
    })

    if (!existingReservation) {
      throw new ReservationNotFoundError()
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    // Change book
    if (bookId && bookId !== existingReservation.bookId) {
      const newBook = await db.query.books.findFirst({
        where: and(eq(schema.books.id, bookId), isNull(schema.books.deletedAt)),
      })

      if (!newBook) {
        throw new BookNotFoundError()
      }

      // Check if the new book is already reserved by the same reader
      const existingReservationForNewBook =
        await db.query.reservations.findFirst({
          where: and(
            eq(schema.reservations.bookId, bookId),
            eq(schema.reservations.readerId, existingReservation.readerId),
            isNull(schema.reservations.notifiedAt),
            isNull(schema.reservations.expiresAt),
            inArray(schema.reservations.status, ['PENDENTE', 'NOTIFICADO']),
            isNull(schema.reservations.deletedAt)
          ),
        })

      if (existingReservationForNewBook) {
        throw new BookAlreadyReservedError()
      }

      updatePayload.bookId = bookId
    }

    // Alteração da data sugerida
    if (reservationDate !== undefined) {
      updatePayload.reservationDate = reservationDate
        ? new Date(reservationDate)
        : null
    }

    // Update reservation
    await db
      .update(schema.reservations)
      .set(updatePayload)
      .where(eq(schema.reservations.id, reservationId))

    // Busca dados atualizados para o retorno
    const updated = await db.query.reservations.findFirst({
      where: eq(schema.reservations.id, reservationId),
      with: {
        book: true,
        reader: true,
      },
    })

    if (!updated) {
      throw new ReservationNotFoundError()
    }

    return {
      message: `Reserva do livro ${updated.book.title} para ${updated.reader.name} atualizada com sucesso.`,
      reservation: {
        bookId: updated.bookId,
        id: updated.id,
        readerId: updated.readerId,
        reservationDate: updated.reservationDate
          ? formatDate(updated.reservationDate)
          : updated.reservationDate,
        status: updated.status,
      },
    }
  }
}
