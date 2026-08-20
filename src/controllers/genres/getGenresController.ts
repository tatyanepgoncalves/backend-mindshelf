import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetGenreQuerySchema } from '../../schemas/genres/getGenreSchema.js'
import { GetGenresService } from '../../services/genres/getGenresService.js'

export class GetGenresController {
  async handle(
    request: FastifyRequest<{ Querystring: GetGenreQuerySchema }>,
    reply: FastifyReply
  ) {
    const { name } = request.query
    const getGenresService = new GetGenresService()

    try {
      const result = await getGenresService.execute(request.user.role, name)
      return reply.status(200).send(result)
    } catch (error) {
      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
