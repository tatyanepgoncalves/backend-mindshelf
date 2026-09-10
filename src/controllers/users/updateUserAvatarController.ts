import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UpdateUserBodySchema } from '../../schemas/users/updateUserSchema.js'
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../services/users/error.js'
import { UpdateUserAvatarService } from '../../services/users/updateUserAvatarService.js'

// No seu controller/handler do Fastify
export async function updateUserAvatarController(
  request: FastifyRequest<{ Body: UpdateUserBodySchema }>,
  reply: FastifyReply
) {
  const userId = request.user?.id
  const { image } = request.body

  try {
    const service = new UpdateUserAvatarService()
    const result = await service.execute(userId, image || null)

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
