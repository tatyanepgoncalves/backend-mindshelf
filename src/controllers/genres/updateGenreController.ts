import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateGenreBody,
  UpdateGenreParams,
} from '../../schemas/genres/updateGenreSchema.js'
import {
  GenreAlreadyExistsError,
  GenreNotFoundError,
  UnauthorizedRestoreError,
  UpdateGenreService,
} from '../../services/genres/updateGenreService.js'

export class UpdateGenreController {
  async handle(
    request: FastifyRequest<{
      Body: UpdateGenreBody
      Params: UpdateGenreParams
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const data = request.body
    const userRole = request.user.role
    const updateGenreService = new UpdateGenreService()

    try {
      const result = await updateGenreService.execute(id, data, userRole)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof GenreNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      if (error instanceof GenreAlreadyExistsError) {
        return reply.status(409).send({ message: error.message })
      }

      if (error instanceof UnauthorizedRestoreError) {
        return reply.status(403).send({ message: error.message })
      }

      console.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
