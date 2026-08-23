import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { LookupIsbnController } from '../../controllers/books/lookupIsbnController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { lookupIsbnSchema } from '../../schemas/books/lookupIsbnSchema.js'

export const lookupIsbnRoute: FastifyPluginCallbackZod = (app) => {
  const controller = new LookupIsbnController()

  app.get(
    '/books/lookup-isbn/:isbn',
    {
      preHandler: [authMiddleware],
      schema: lookupIsbnSchema,
    },
    async (request, reply) => controller.handle(request, reply)
  )
}
