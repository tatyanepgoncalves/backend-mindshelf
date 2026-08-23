import type { FastifyReply, FastifyRequest } from 'fastify'
import type { LookupIsbnParamsSchema } from '../../schemas/books/lookupIsbnSchema.js'
import {
  FetchBookByIsbnService,
  IsbnNotFoundError,
} from '../../services/books/fetchBookByIsbnService.js'

export class LookupIsbnController {
  async handle(
    request: FastifyRequest<{ Params: LookupIsbnParamsSchema }>,
    reply: FastifyReply
  ) {
    const { isbn } = request.params
    const fetchBookByIsbnService = new FetchBookByIsbnService()

    try {
      const bookData = await fetchBookByIsbnService.execute(isbn)
      return reply.status(200).send(bookData)
    } catch (error) {
      if (error instanceof IsbnNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      return reply
        .status(500)
        .send({ message: 'Erro ao consultar serviço de ISBN.' })
    }
  }
}
