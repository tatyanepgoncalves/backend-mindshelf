import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  DeleteOrCancelReservationParamsSchema,
  DeleteOrCancelReservationQuerystringSchema,
} from '../../schemas/reservations/deleteOrCancelReservationSchema.js'
import {
  DeleteOrCancelReservationService,
  ForbiddenReservationActionError,
  InvalidActionCombinationError,
  ReservationNotFoundError,
} from '../../services/reservation/deleteOrCancelReservationService.js'

export class DeleteOrCancelReservationController {
  async handle(
    request: FastifyRequest<{
      Params: DeleteOrCancelReservationParamsSchema
      Querystring: DeleteOrCancelReservationQuerystringSchema
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const userId = request.user.id
    const userRole = request.user.role
    const deleteOrCancelService = new DeleteOrCancelReservationService()

    try {
      const result = await deleteOrCancelService.execute(
        id,
        request.query,
        userRole,
        userId
      )

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof InvalidActionCombinationError) {
        return reply.status(400).send({ message: error.message })
      }
      if (error instanceof ForbiddenReservationActionError) {
        return reply.status(403).send({ message: error.message })
      }
      if (error instanceof ReservationNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
