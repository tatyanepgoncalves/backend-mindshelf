import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { CreateReservationController } from '../../controllers/reservations/createReservationController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { createReservationSchema } from '../../schemas/reservations/createReservationSchema.js'

export const createReservationRoute: FastifyPluginCallbackZod = (app) => {
  const controller = new CreateReservationController()

  app.post(
    '/reservations',
    {
      preHandler: [authMiddleware],
      schema: createReservationSchema,
    },
    async (request, reply) => controller.handle(request, reply)
  )
}
