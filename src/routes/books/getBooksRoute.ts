import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetBooksController } from '../../controllers/books/getBooksController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getBooksSchema } from '../../schemas/books/getBooksSchema.js'

export const getBooksRoute: FastifyPluginCallbackZod = (app) => {
  const getBooksController = new GetBooksController()

  app.get(
    '/books',
    {
      preHandler: [authMiddleware],
      schema: getBooksSchema,
    },
    async (request, reply) => getBooksController.handle(request, reply)
  )
}
