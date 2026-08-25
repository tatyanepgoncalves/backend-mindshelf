import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetReservationsQuerySchema } from '../../schemas/reservations/getReservationsSchema.js'
import {
  GetReservationsService,
  ReservationsNotFoundError,
} from '../../services/reservation/getReservationsService.js'

export class GetReservationsController {
  async handle(
    request: FastifyRequest<{ Querystring: GetReservationsQuerySchema }>,
    reply: FastifyReply
  ) {
    const getReservationsService = new GetReservationsService()

    try {
      const result = await getReservationsService.execute(request.query)
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof ReservationsNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
