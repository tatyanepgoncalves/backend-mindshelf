import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { DeleteUserByTokenController } from '../../controllers/users/deleteUserByTokenController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeSelf } from '../../middlewares/authorizeSelf.js'
import { deleteUserByTokenSchema } from '../../schemas/users/deleteUserByTokenSchema.js'

export const deleteUserByTokenRoute: FastifyPluginCallbackZod = (app) => {
  const deleteUserByTokenController = new DeleteUserByTokenController()

  app.delete(
    '/users/token',
    {
      preHandler: [authMiddleware, authorizeSelf],
      schema: deleteUserByTokenSchema,
    },
    async (request, reply) => deleteUserByTokenController.handle(request, reply)
  )
}
