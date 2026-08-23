import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateBookBySlugBodySchema,
  UpdateBookBySlugParamsSchema,
} from '../../schemas/books/updateBookBySlugSchema.js'
import { SlugBookNotFoundError } from '../../services/books/getBookBySlugService.js'
import {
  ConflictBookError,
  UnauthorizedUpdateError,
  UpdateBookBySlugService,
} from '../../services/books/updateBookBySlugService.js'

export class UpdateBookBySlugController {
  async handle(
    request: FastifyRequest<{
      Body: UpdateBookBySlugBodySchema
      Params: UpdateBookBySlugParamsSchema
    }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params
    const data = request.body
    const userRole = request.user.role
    const updateBookBySlugService = new UpdateBookBySlugService()

    try {
      const result = await updateBookBySlugService.execute(slug, userRole, data)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof SlugBookNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof ConflictBookError) {
        return reply.status(409).send({ message: error.message })
      }

      if (error instanceof UnauthorizedUpdateError) {
        return reply.status(403).send({ message: error.message })
      }

      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
