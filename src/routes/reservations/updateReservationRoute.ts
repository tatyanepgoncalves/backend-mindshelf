import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { UpdateReservationController } from '../../controllers/reservations/updateReservationController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeAdminOrVolunteer } from '../../middlewares/authorizeAdminOrVolunteer.js'
import { updateReservationSchema } from '../../schemas/reservations/updateReservationSchema.js'

export const updateReservationRoute: FastifyPluginCallbackZod = (app) => {
  const controller = new UpdateReservationController()

  app.patch(
    '/reservations/:id',
    {
      preHandler: [authMiddleware, authorizeAdminOrVolunteer],
      schema: updateReservationSchema,
    },
    async (request, reply) => controller.handle(request, reply)
  )
}
