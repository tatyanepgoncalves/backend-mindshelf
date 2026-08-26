import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import type { DeleteOrCancelReservationQuerystringSchema } from '../../schemas/reservations/deleteOrCancelReservationSchema.js'

export class ReservationNotFoundError extends Error {
  constructor() {
    super('Reserva não encontrada.')
  }
}

export class ForbiddenReservationActionError extends Error {
  constructor(message = 'Você não tem permissão para realizar esta ação.') {
    super(message)
  }
}

export class InvalidActionCombinationError extends Error {
  constructor() {
    super('Informe apenas uma ação por vez: "cancel" ou "delete".')
  }
}

export class DeleteOrCancelReservationService {
  async execute(
    reservationId: string,
    query: DeleteOrCancelReservationQuerystringSchema,
    userRole: string,
    userId: string
  ) {
    const { cancel, delete: isDelete } = query

    // Impede enviar ambos os parâmetros simultaneamente
    if (cancel && isDelete) {
      throw new InvalidActionCombinationError()
    }

    // Busca a reserva ignorando registros já soft-deleted se for cancelamento
    const reservation = await db.query.reservations.findFirst({
      where: eq(schema.reservations.id, reservationId),
    })

    if (!reservation) {
      throw new ReservationNotFoundError()
    }

    const isOwner = reservation.readerId === userId
    const isStaff = userRole === 'ADMIN' || userRole === 'VOLUNTARIO'

    // Apenas dono, ADMIN ou VOLUNTÁRIO podem mexer na reserva
    if (!(isOwner || isStaff)) {
      throw new ForbiddenReservationActionError()
    }

    // Cenário de CANCELAMENTO (Marca status como CANCELADO e faz Soft Delete)
    if (cancel) {
      if (reservation.deletedAt) {
        throw new ReservationNotFoundError()
      }

      await db
        .update(schema.reservations)
        .set({
          deletedAt: new Date(),
          status: 'CANCELADO',
          updatedAt: new Date(),
        })
        .where(eq(schema.reservations.id, reservationId))

      return { message: 'Reserva cancelada com sucesso.' }
    }

    // Cenário de DELEÇÃO (Soft Delete ou Hard Delete definitivo)
    if (isDelete) {
      // Se for Staff (ADMIN/VOLUNTÁRIO), realiza Exclusão Definitiva (Hard Delete)
      if (isStaff) {
        await db
          .delete(schema.reservations)
          .where(eq(schema.reservations.id, reservationId))

        return { message: 'Reserva excluída permanentemente do sistema.' }
      }

      // Se for o leitor dono, realiza Soft Delete (Exclusão temporária/desativação)
      if (reservation.deletedAt) {
        throw new ReservationNotFoundError()
      }

      await db
        .update(schema.reservations)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.reservations.id, reservationId))

      return { message: 'Reserva movida para a lixeira.' }
    }

    throw new InvalidActionCombinationError()
  }
}
