import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetGenresController } from '../../controllers/genres/getGenresController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getGenreSchema } from '../../schemas/genres/getGenreSchema.js'

export const getGenresRoute: FastifyPluginCallbackZod = (app) => {
  const getGenresController = new GetGenresController()

  app.get(
    '/genres',
    {
      preHandler: [authMiddleware],
      schema: getGenreSchema,
    },
    async (request, reply) => await getGenresController.handle(request, reply)
  )
}
