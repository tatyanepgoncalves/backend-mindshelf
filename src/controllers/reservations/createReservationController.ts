import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateReservationBodySchema } from '../../schemas/reservations/createReservationSchema.js'
import {
  BookAlreadyReservedError,
  BookNotFoundError,
  CreateReservationService,
  ReaderNotFoundError,
} from '../../services/reservation/createReservationService.js'

export class CreateReservationController {
  async handle(
    request: FastifyRequest<{ Body: CreateReservationBodySchema }>,
    reply: FastifyReply
  ) {
    const createReservationService = new CreateReservationService()

    try {
      const result = await createReservationService.execute(request.body)
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
