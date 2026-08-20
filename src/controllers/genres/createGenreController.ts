import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateGenreSchema } from '../../schemas/genres/createGenreSchema.js'
import {
  CreateGenreService,
  GenreAlreadyExistError,
} from '../../services/genres/createGenreService.js'

export class CreateGenreController {
  async handle(
    request: FastifyRequest<{ Body: CreateGenreSchema }>,
    reply: FastifyReply
  ) {
    const createGenreService = new CreateGenreService()

    try {
      const result = await createGenreService.execute(request.body)

      return reply.status(201).send(result)
      // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    } catch (error: any) {
      if (error instanceof GenreAlreadyExistError) {
        return reply.status(409).send({ message: error.message })
      }

      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
