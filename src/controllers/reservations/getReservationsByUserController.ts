import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetReservationsQuerySchema } from '../../schemas/reservations/getReservationsSchema.js'
import { ReservationsNotFoundError } from '../../services/reservation/errors.js'
import { GetReservationsByUserService } from '../../services/reservation/getReservationsByUserService.js'
import { UserNotFoundError } from '../../services/users/loginUserService.js'

export class GetReservationsByUserController {
  async handle(
    request: FastifyRequest<{ Querystring: GetReservationsQuerySchema }>,
    reply: FastifyReply
  ) {
    const getReservationsByUserService = new GetReservationsByUserService()

    try {
      const userId = request.user?.id
      const result = await getReservationsByUserService.execute(
        userId,
        request.query
      )
      return reply.status(200).send(result)
    } catch (error) {
      if (
        error instanceof UserNotFoundError ||
        error instanceof ReservationsNotFoundError
      ) {
        return reply.status(404).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
