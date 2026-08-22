import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetBookBySlugController } from '../../controllers/books/getBookBySlugController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getBookBySlugSchema } from '../../schemas/books/getBookBySlugSchema.js'

export const getBookBySlugRoute: FastifyPluginCallbackZod = (app) => {
  const getBookBySlugController = new GetBookBySlugController()

  app.get(
    '/books/:slug',
    {
      preHandler: [authMiddleware],
      schema: getBookBySlugSchema,
    },
    async (request, reply) => getBookBySlugController.handle(request, reply)
  )
}
