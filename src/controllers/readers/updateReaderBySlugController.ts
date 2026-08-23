import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateReaderBodySchema,
  UpdateReaderParamsSchema,
} from '../../schemas/readers/updateReaderSchema.js'
import {
  ReaderNotFoundError,
  UpdateReaderBySlugService,
} from '../../services/readers/updateReaderBySlugService.js'
import { UserAlreadyExistsError } from '../../services/users/createUserService.js'

export class UpdateReaderBySlugController {
  async handle(
    request: FastifyRequest<{
      Body: UpdateReaderBodySchema
      Params: UpdateReaderParamsSchema
    }>,
    reply: FastifyReply
  ) {
    // Implementation for handling update user request
    const { slug } = request.params
    const updateReaderService = new UpdateReaderBySlugService()

    try {
      const result = await updateReaderService.execute(slug, request.body)

      return reply.status(200).send(result)
      // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    } catch (error: any) {
      if (error instanceof ReaderNotFoundError) {
        return reply.status(404).send({ message: error.message })
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
