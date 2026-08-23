import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetReaderBySlugParamsSchema } from '../../schemas/readers/getReaderBySlugSchema.js'
import {
  GetReaderBySlugService,
  SlugReaderNotFoundError,
} from '../../services/readers/getReaderBySlugService.js'

export class GetReaderBySlugController {
  async handle(
    request: FastifyRequest<{ Params: GetReaderBySlugParamsSchema }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params
    const getReaderBySlugService = new GetReaderBySlugService()

    try {
      const result = await getReaderBySlugService.execute(slug)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof SlugReaderNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      return reply.status(500).send({
        message: 'Erro interno do servidor.',
      })
    }
  }
}
