import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { UpdateUserRoleBySlugController } from '../../controllers/users/updateUserRoleBySlugController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeAdminOrVolunteer } from '../../middlewares/authorizeAdminOrVolunteer.js'
import { updateUserRoleSchema } from '../../schemas/users/updateUserRoleSchema.js'

export const updateUserRoleBySlugRoute: FastifyPluginCallbackZod = (app) => {
  const updateUserRoleController = new UpdateUserRoleBySlugController()

  app.patch(
    '/users/role/:slug',
    {
      preHandler: [authMiddleware, authorizeAdminOrVolunteer],
      schema: updateUserRoleSchema,
    },
    async (request, reply) => updateUserRoleController.handle(request, reply)
  )
}
