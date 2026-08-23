import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetReadersController } from '../../controllers/readers/getReadersController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getReadersSchema } from '../../schemas/readers/getReadersSchema.js'

export const getReadersRoute: FastifyPluginCallbackZod = (app) => {
  const getReadersController = new GetReadersController()

  app.get(
    '/readers',
    {
      preHandler: [authMiddleware],
      schema: getReadersSchema,
    },
    async (request, reply) => getReadersController.handle(request, reply)
  )
}
