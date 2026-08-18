import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetUserProfileController } from '../../controllers/users/getUserProfileController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getUserProfileSchema } from '../../schemas/users/getUserProfileSchema.js'

export const getUserProfileRoute: FastifyPluginCallbackZod = (app) => {
  const getUserProfileController = new GetUserProfileController()

  app.get(
    '/users/me',
    {
      preHandler: [authMiddleware],
      schema: getUserProfileSchema,
    },
    async (request, reply) => getUserProfileController.handle(request, reply)
  )
}
