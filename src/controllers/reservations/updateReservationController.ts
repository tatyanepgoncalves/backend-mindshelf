import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateReservationBodySchema,
  UpdateReservationParamsSchema,
} from '../../schemas/reservations/updateReservationSchema.js'

import {
  BookAlreadyReservedError,
  BookNotFoundError,
  ForbiddenReservationUpdateError,
  ReservationNotFoundError,
  UpdateReservationService,
} from '../../services/reservation/updateReservationService.js'

export class UpdateReservationController {
  async handle(
    request: FastifyRequest<{
      Params: UpdateReservationParamsSchema
      Body: UpdateReservationBodySchema
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const updateReservationService = new UpdateReservationService()

    try {
      const result = await updateReservationService.execute(id, request.body)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof ForbiddenReservationUpdateError) {
        return reply.status(403).send({ message: error.message })
      }

      if (
        error instanceof ReservationNotFoundError ||
        error instanceof BookNotFoundError
      ) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof BookAlreadyReservedError) {
        return reply.status(409).send({ message: error.message })
      }

      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
