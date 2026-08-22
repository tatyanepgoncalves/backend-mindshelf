import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetBooksQuerySchema } from '../../schemas/books/getBooksSchema.js'
import { GetBooksService } from '../../services/books/getBooksService.js'

export class GetBooksController {
  async handle(
    request: FastifyRequest<{ Querystring: GetBooksQuerySchema }>,
    reply: FastifyReply
  ) {
    const { title, author, genreIds } = request.query
    const getBooksService = new GetBooksService()

    // Normaliza para sempre ser um array de strings (ou undefined)
    let formattedGenreIds: string[] | undefined

    if (genreIds) {
      formattedGenreIds = Array.isArray(genreIds) ? genreIds : [genreIds]
    }

    try {
      const result = await getBooksService.execute(
        request.user.role,
        title,
        author,
        formattedGenreIds
      )

      return reply.status(200).send(result)
      // biome-ignore lint/complexity/noUselessCatchBinding: it's necessary
      // biome-ignore lint/correctness/noUnusedVariables: it's necessary
    } catch (error) {
      return reply.status(500).send({
        message: 'Erro interno do servidor.',
      })
    }
  }
}
