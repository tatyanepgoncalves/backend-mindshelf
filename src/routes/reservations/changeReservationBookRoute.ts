import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { ChangeReservationBookController } from '../../controllers/reservations/changeReservationBookController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeSelf } from '../../middlewares/authorizeSelf.js'
import { changeReservationBookSchema } from '../../schemas/reservations/changeReservationBookSchema.js'

export const changeReservationBookRoute: FastifyPluginCallbackZod = (app) => {
  const controller = new ChangeReservationBookController()

  app.put(
    '/reservations/book/:id',
    {
      preHandler: [authMiddleware, authorizeSelf],
      schema: changeReservationBookSchema,
    },
    (request, reply) => controller.handle(request, reply)
  )
}
