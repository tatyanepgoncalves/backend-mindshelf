import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetReservationsController } from '../../controllers/reservations/getReservationsController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getReservationsSchema } from '../../schemas/reservations/getReservationsSchema.js'

export const getReservationsRoute: FastifyPluginCallbackZod = (app) => {
  const controller = new GetReservationsController()

  app.get(
    '/reservations',
    {
      preHandler: [authMiddleware],
      schema: getReservationsSchema,
    },
    async (request, reply) => controller.handle(request, reply)
  )
}
