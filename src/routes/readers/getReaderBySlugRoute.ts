import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetReaderBySlugController } from '../../controllers/readers/getReaderBySlugController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getReaderBySlugSchema } from '../../schemas/readers/getReaderBySlugSchema.js'

export const getReaderBySlugRoute: FastifyPluginCallbackZod = (app) => {
  const getReaderBySlugController = new GetReaderBySlugController()

  app.get(
    '/readers/:slug',
    {
      preHandler: [authMiddleware],
      schema: getReaderBySlugSchema,
    },
    async (request, reply) => getReaderBySlugController.handle(request, reply)
  )
}
