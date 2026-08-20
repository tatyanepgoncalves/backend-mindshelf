import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { UpdateGenreController } from '../../controllers/genres/updateGenreController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeAdminOrVolunteer } from '../../middlewares/authorizeAdminOrVolunteer.js'
import { updateGenreSchema } from '../../schemas/genres/updateGenreSchema.js'

export const updateGenreRoute: FastifyPluginCallbackZod = (app) => {
  const updateGenreController = new UpdateGenreController()

  app.patch(
    '/genres/:id',
    {
      preHandler: [authMiddleware, authorizeAdminOrVolunteer],
      schema: updateGenreSchema,
    },
    async (request, reply) => updateGenreController.handle(request, reply)
  )
}
