import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { CreateUserController } from '../../controllers/users/createUserController.js'
import { createUserSchema } from '../../schemas/users/createUserSchema.js'

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
  const createUserController = new CreateUserController()

  app.post(
    '/users',
    {
      schema: createUserSchema,
    },
    async (request, reply) => createUserController.handle(request, reply)
  )
}
