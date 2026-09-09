import type { FastifyReply, FastifyRequest } from 'fastify'
import { DeleteUserByTokenService } from '../../services/users/deleteUserByTokenService.js'
import { UserNotFoundError } from '../../services/users/error.js'

export class DeleteUserByTokenController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const deleteUserService = new DeleteUserByTokenService()

      const result = await deleteUserService.execute(request.user?.id)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }

      return reply.status(500).send({ message: 'Error interno do servidor.' })
    }
  }
}
