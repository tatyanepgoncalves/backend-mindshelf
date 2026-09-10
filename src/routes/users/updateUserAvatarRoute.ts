import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { UpdateUserController } from '../../controllers/users/updateUserController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeSelf } from '../../middlewares/authorizeSelf.js'
import { updateUserSchema } from '../../schemas/users/updateUserSchema.js'

export const updateUserAvatarRoute: FastifyPluginCallbackZod = (app) => {
  const updateUserController = new UpdateUserController()

  app.patch(
    '/users/me/avatar',
    {
      preHandler: [authMiddleware, authorizeSelf],
      schema: updateUserSchema,
    },
    async (request, reply) => updateUserController.handle(request, reply)
  )
}
