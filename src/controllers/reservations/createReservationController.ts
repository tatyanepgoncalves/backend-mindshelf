import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateReservationBodySchema } from '../../schemas/reservations/createReservationSchema.js'
import {
  BookNotFoundError,
  ReaderNotFoundError,
} from '../../services/loans/errors.js'
import { BookAlreadyReservedError } from '../../services/reservation/changeReservationBookService.js'
import { CreateReservationService } from '../../services/reservation/createReservationService.js'

export class CreateReservationController {
  async handle(
    request: FastifyRequest<{ Body: CreateReservationBodySchema }>,
    reply: FastifyReply
  ) {
    const createReservationService = new CreateReservationService()

    try {
      // request.user.sub vem preenchido pelo authMiddleware do Fastify
      const authenticatedUserId = request.user.sub
      const result = await createReservationService.execute({
        ...request.body,
        authenticatedUserId,
      })
      return reply.status(201).send(result)
    } catch (error) {
      if (
        error instanceof ReaderNotFoundError ||
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
