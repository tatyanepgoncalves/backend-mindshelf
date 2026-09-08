import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetReservationsByUserController } from '../../controllers/reservations/getReservationsByUserController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getReservationsByUserSchema } from '../../schemas/reservations/getReservationsByUserSchema.js'

export const getReservationsByUserRoute: FastifyPluginCallbackZod = (app) => {
  const controller = new GetReservationsByUserController()

  app.get(
    '/reservations/user',
    {
      preHandler: [authMiddleware],
      schema: getReservationsByUserSchema,
    },
    async (request, reply) => controller.handle(request, reply)
  )
}
