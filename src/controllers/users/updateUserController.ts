import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateUserBodySchema,
  UpdateUserParamsSchema,
} from '../../schemas/users/updateUserSchema.js'
import { UserAlreadyExistsError } from '../../services/users/createUserService.js'
import { UserNotFoundError } from '../../services/users/loginUserService.js'
import { UpdateUserService } from '../../services/users/updateUserService.js'

export class UpdateUserController {
  async handle(
    request: FastifyRequest<{
      Body: UpdateUserBodySchema
      Params: UpdateUserParamsSchema
    }>,
    reply: FastifyReply
  ) {
    // Implementation for handling update user request
    const { id } = request.params
    const updateUserService = new UpdateUserService()

    try {
      const result = await updateUserService.execute(id, request.body)

      console.log(result)

      return reply.status(200).send(result)
      // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    } catch (error: any) {
      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof UserAlreadyExistsError || error.code === '23505') {
        return reply.status(409).send({
          message: 'Email ou telefone já cadastrado por outro usuário.',
        })
      }

      return reply.status(500).send({ message: 'Erro ao atualizar usuário.' })
    }
  }
}
