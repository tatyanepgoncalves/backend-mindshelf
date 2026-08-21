import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { DeleteGenreByIdController } from '../../controllers/genres/deleteGenreByIdController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { deleteGenreByIdSchema } from '../../schemas/genres/deleteGenreByIdSchema.js'

export const deleteGenreByIdRoute: FastifyPluginCallbackZod = (app) => {
  const deleteGenreByIdController = new DeleteGenreByIdController()

  app.delete(
    '/genres/:id',
    {
      preHandler: [authMiddleware],
      schema: deleteGenreByIdSchema,
    },
    async (request, reply) => deleteGenreByIdController.handle(request, reply)
  )
}
