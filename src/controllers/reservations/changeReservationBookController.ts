import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  ChangeReservationBookBodySchema,
  ChangeReservationBookParamsSchema,
} from '../../schemas/reservations/changeReservationBookSchema.js'
import {
  BookNotFoundError,
  ChangeReservationBookService,
} from '../../services/reservation/changeReservationBookService.js'
import { BookAlreadyReservedError } from '../../services/reservation/createReservationService.js'
import { ReservationNotFoundError } from '../../services/reservation/updateReservationService.js'

export class ChangeReservationBookController {
  async handle(
    request: FastifyRequest<{
      Params: ChangeReservationBookParamsSchema
      Body: ChangeReservationBookBodySchema
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const changeReservationBookService = new ChangeReservationBookService()

    try {
      const result = await changeReservationBookService.execute(
        id,
        request.body
      )
      return reply.status(200).send(result)
    } catch (error) {
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
