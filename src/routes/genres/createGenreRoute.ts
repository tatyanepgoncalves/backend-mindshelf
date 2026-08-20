import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { CreateGenreController } from '../../controllers/genres/createGenreController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { verifyUserRole } from '../../middlewares/verifyUserRole.js'
import { createGenreSchema } from '../../schemas/genres/createGenreSchema.js'

export const createGenreRoute: FastifyPluginCallbackZod = (app) => {
  const createGenreController = new CreateGenreController()

  app.post(
    '/genres',
    {
      preHandler: [authMiddleware, verifyUserRole('ADMIN')],
      schema: createGenreSchema,
    },
    async (request, reply) => createGenreController.handle(request, reply)
  )
}
