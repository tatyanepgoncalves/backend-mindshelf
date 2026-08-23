import type { FastifyReply, FastifyRequest } from 'fastify'
import type { DeleteReaderBySlugParamsSchema } from '../../schemas/readers/deleteReaderBySlugSchema.js'
import { DeleteReaderBySlugService } from '../../services/readers/deleteReaderBySlugService.js'
import { UserNotFoundError } from '../../services/users/loginUserService.js'

export class DeleteReaderBySlugController {
  async handle(
    request: FastifyRequest<{ Params: DeleteReaderBySlugParamsSchema }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params
    const deleteReaderBySlugService = new DeleteReaderBySlugService()

    try {
      const result = await deleteReaderBySlugService.execute(slug)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }

      return reply.status(500).send({ message: 'Error interno do servidor.' })
    }
  }
}
