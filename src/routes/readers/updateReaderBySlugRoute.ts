import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { UpdateReaderBySlugController } from '../../controllers/readers/updateReaderBySlugController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeSelf } from '../../middlewares/authorizeSelf.js'
import { updateReaderSchema } from '../../schemas/readers/updateReaderSchema.js'

export const updateReaderBySlugRoute: FastifyPluginCallbackZod = (app) => {
  const updateReaderController = new UpdateReaderBySlugController()

  app.patch(
    '/readers/:slug',
    {
      preHandler: [authMiddleware, authorizeSelf],
      schema: updateReaderSchema,
    },
    async (request, reply) => updateReaderController.handle(request, reply)
  )
}
