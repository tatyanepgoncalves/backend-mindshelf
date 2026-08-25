import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatDate, formatPhone, formatRelativeTime } from '../../lib/utils.js'
import type { UpdateReservationBodySchema } from '../../schemas/reservations/updateReservationSchema.js'

export class ReservationNotFoundError extends Error {
  constructor() {
    super('Reserva não encontrada.')
  }
}

export class ForbiddenReservationUpdateError extends Error {
  constructor(
    message = 'Você não tem permissão para realizar esta alteração.'
  ) {
    super(message)
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

export class UpdateReservationService {
  async execute(reservationId: string, data: UpdateReservationBodySchema) {
    const { bookId, reservationDate, status, expirationDays = 7 } = data

    // Busca reserva existente
    const existingReservation = await db.query.reservations.findFirst({
      where: and(
        eq(schema.reservations.id, reservationId),
        isNull(schema.reservations.deletedAt)
      ),
      with: {
        book: true,
        reader: true,
      },
    })

    if (!existingReservation) {
      throw new ReservationNotFoundError()
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    // Troca de Livro
    if (bookId && bookId !== existingReservation.bookId) {
      const newBook = await db.query.books.findFirst({
        where: and(eq(schema.books.id, bookId), isNull(schema.books.deletedAt)),
      })

      if (!newBook) {
        throw new BookNotFoundError()
      }

      // Verifica duplicidade de reserva ativa no novo livro
      const activeReservation = await db.query.reservations.findFirst({
        where: and(
          eq(schema.reservations.readerId, existingReservation.readerId),
          eq(schema.reservations.bookId, bookId),
          inArray(schema.reservations.status, ['PENDENTE', 'NOTIFICADO']),
          isNull(schema.reservations.deletedAt)
        ),
      })

      if (activeReservation) {
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

    // Atualização de status e lógica de NOTIFICADO/expiresAt
    if (status) {
      updatePayload.status = status

      if (status === 'NOTIFICADO') {
        const now = new Date()
        updatePayload.notifiedAt = now

        // Base para soma do tempo de expiração (usa reservation_date se existir, senão data atual)
        const baseDate = existingReservation.reservationDate
          ? new Date(existingReservation.reservationDate)
          : now

        // Garante limite entre 7 e 30 dias
        const daysToAdd = Math.min(Math.max(expirationDays, 7), 30)

        const expiration = new Date(baseDate)
        expiration.setDate(expiration.getDate() + daysToAdd)

        updatePayload.expiresAt = expiration
      }
    }

    // Se o leitor cancelou, preenchemos o deletedAt (soft delete)
    if (status === 'CANCELADO') {
      updatePayload.deletedAt = new Date()
    }

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
      message: 'Reserva atualizada com sucesso.',
      reservation: {
        book: {
          author: updated.book.author,
          coverUrl: updated.book.coverUrl ?? null,
          id: updated.book.id,
          isbn: updated.book.isbn ?? null,
          locationLibrary: updated.book.locationLibrary ?? null,
          publisher: updated.book.publisher ?? null,
          synopsis: updated.book.synopsis ?? null,
          title: updated.book.title,
        },
        createdAt: updated.createdAt
          ? formatRelativeTime(updated.createdAt)
          : formatRelativeTime(new Date()),
        expiresAt: updated.expiresAt ? formatDate(updated.expiresAt) : null,
        id: updated.id,
        notifiedAt: updated.notifiedAt
          ? formatRelativeTime(updated.notifiedAt)
          : null,
        reader: {
          contact: {
            address: updated.reader.address ?? null,
            email: updated.reader.email,
            phone: updated.reader.phone
              ? formatPhone(updated.reader.phone)
              : null,
          },
          id: updated.reader.id,
          name: updated.reader.name,
        },
        reservationDate: updated.reservationDate
          ? formatRelativeTime(updated.reservationDate)
          : null,
        status: updated.status,
      },
    }
  }
}
