import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { UpdateBookBySlugController } from '../../controllers/books/updateBookBySlugController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { updateBookBySlugSchema } from '../../schemas/books/updateBookBySlugSchema.js'

export const updateBookBySlugRoute: FastifyPluginCallbackZod = (app) => {
  const updateBookBySlugController = new UpdateBookBySlugController()

  app.patch(
    '/books/:slug',
    {
      preHandler: [authMiddleware],
      schema: updateBookBySlugSchema,
    },
    async (request, reply) => updateBookBySlugController.handle(request, reply)
  )
}
