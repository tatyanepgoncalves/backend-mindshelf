import type { FastifyReply, FastifyRequest } from 'fastify'
import { UserNotFoundError } from '../../services/users/error.js'
import { GetUserProfileService } from '../../services/users/getUserProfileService.js'

export class GetUserProfileController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.id

      const getUserProfileService = new GetUserProfileService()

      const result = await getUserProfileService.execute(userId)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  }
}
