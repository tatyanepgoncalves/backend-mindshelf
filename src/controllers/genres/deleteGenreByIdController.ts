import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  DeleteGenreByIdParams,
  DeleteGenreByIdQuerystring,
} from '../../schemas/genres/deleteGenreByIdSchema.js'
import {
  DeleteGenreByIdService,
  GenreNotFoundOrHadArquivedError,
  UnauthorizedHardDeleteError,
} from '../../services/genres/DeleteGenreByIdService.js'

export class DeleteGenreByIdController {
  async handle(
    request: FastifyRequest<{
      Params: DeleteGenreByIdParams
      Querystring: DeleteGenreByIdQuerystring
    }>,
    reply: FastifyReply
  ) {
    try {
      const genreId = request.params.id
      const permanente = request.query.permanente ?? false
      const userRole = request.user.role
      const deleteGenreByIdService = new DeleteGenreByIdService()

      const result = await deleteGenreByIdService.execute(
        genreId,
        permanente,
        userRole
      )

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof GenreNotFoundOrHadArquivedError) {
        return reply.status(404).send({
          message: error.message,
        })
      }

      if (error instanceof UnauthorizedHardDeleteError) {
        return reply.status(403).send({
          message: error.message,
        })
      }

      console.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
