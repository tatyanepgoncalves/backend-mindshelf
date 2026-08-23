import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { DeleteReaderBySlugController } from '../../controllers/readers/deleteReaderBySlugController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeSelfOrAdmin } from '../../middlewares/authorizeSelfOrAdmin.js'
import { deleteReaderBySlugSchema } from '../../schemas/readers/deleteReaderBySlugSchema.js'

export const deleteReaderBySlugRoute: FastifyPluginCallbackZod = (app) => {
  const deleteReaderBySlugController = new DeleteReaderBySlugController()

  app.delete(
    '/readers/:slug',
    {
      preHandler: [authMiddleware, authorizeSelfOrAdmin],
      schema: deleteReaderBySlugSchema,
    },
    async (request, reply) =>
      deleteReaderBySlugController.handle(request, reply)
  )
}
