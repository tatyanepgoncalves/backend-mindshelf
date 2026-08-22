import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetBookBySlugParamsSchema } from '../../schemas/books/getBookBySlugSchema.js'
import {
  GetBookBySlugService,
  SlugBookNotFoundError,
} from '../../services/books/getBookBySlugService.js'

export class GetBookBySlugController {
  async handle(
    request: FastifyRequest<{ Params: GetBookBySlugParamsSchema }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params
    const getBookBySlugService = new GetBookBySlugService()

    try {
      const result = await getBookBySlugService.execute(slug)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof SlugBookNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      return reply.status(500).send({ error: 'Error interno de servidor' })
    }
  }
}
