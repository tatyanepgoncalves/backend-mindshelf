import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetReadersQuerySchema } from '../../schemas/readers/getReadersSchema.js'
import { GetReadersService } from '../../services/readers/getReadersService.js'

export class GetReadersController {
  async handle(
    request: FastifyRequest<{ Querystring: GetReadersQuerySchema }>,
    reply: FastifyReply
  ) {
    const { name } = request.query
    const getReadersService = new GetReadersService()

    try {
      const result = await getReadersService.execute(request.user.role, name)

      return reply.status(200).send(result)
      // biome-ignore lint/complexity/noUselessCatchBinding: it's necessary
      // biome-ignore lint/correctness/noUnusedVariables: it's necessary
    } catch (error) {
      return reply.status(500).send({
        message: 'Erro interno do servidor.',
      })
    }
  }
}
