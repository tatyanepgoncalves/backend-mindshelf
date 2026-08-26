import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { DeleteOrCancelReservationController } from '../../controllers/reservations/deleteOrCancelReservationController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { deleteOrCancelReservationSchema } from '../../schemas/reservations/deleteOrCancelReservationSchema.js'

export const deleteOrCancelReservationRoute: FastifyPluginCallbackZod = (
  app
) => {
  const controller = new DeleteOrCancelReservationController()

  app.delete(
    '/reservations/:id',
    {
      preHandler: [authMiddleware],
      schema: deleteOrCancelReservationSchema,
    },
    async (request, reply) => controller.handle(request, reply)
  )
}
