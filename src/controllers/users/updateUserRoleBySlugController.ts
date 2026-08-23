import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateUserRoleBodySchema,
  UpdateUserRoleParamsSchema,
} from '../../schemas/users/updateUserRoleSchema.js'
import { UserAlreadyExistsError } from '../../services/users/createUserService.js'
import { UserNotFoundError } from '../../services/users/loginUserService.js'
import {
  UpdateUserRoleBySlugService,
  UserNotAuthoridedError,
} from '../../services/users/updateUserRoleBySlugService.js'

export class UpdateUserRoleBySlugController {
  async handle(
    request: FastifyRequest<{
      Body: UpdateUserRoleBodySchema
      Params: UpdateUserRoleParamsSchema
    }>,
    reply: FastifyReply
  ) {
    // Implementation for handling update user request
    const { slug } = request.params
    const updateUserRoleService = new UpdateUserRoleBySlugService()

    try {
      const result = await updateUserRoleService.execute(slug, request.body)

      return reply.status(200).send(result)
      // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    } catch (error: any) {
      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      console.log(error.message)

      if (error instanceof UserNotAuthoridedError) {
        return reply.status(403).send({ message: error.message })
      }

      if (error instanceof UserAlreadyExistsError || error.code === '23505') {
        return reply.status(409).send({
          message:
            'Email ou telefone já cadastrado por outro usuário ou leitors.',
        })
      }

      return reply.status(500).send({ message: 'Erro ao atualizar leitor.' })
    }
  }
}
