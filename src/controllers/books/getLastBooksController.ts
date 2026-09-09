import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetLastBooksQuerySchema } from '../../schemas/books/getLastBooksSchema.js'
import { GetLastBooksService } from '../../services/books/getLastBooksService.js'

export class GetLastBooksController {
  async handle(
    request: FastifyRequest<{ Querystring: GetLastBooksQuerySchema }>,
    reply: FastifyReply
  ) {
    const { limit } = request.query
    const getLastBooksService = new GetLastBooksService()

    try {
      const result = await getLastBooksService.execute(limit)

      return reply.status(200).send(result)
    } catch (_error) {
      return reply.status(500).send({
        message: 'Erro interno ao buscar os últimos livros.',
      })
    }
  }
}