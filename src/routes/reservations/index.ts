import type { FastifyInstance } from 'fastify'
import { changeReservationBookRoute } from './changeReservationBookRoute.js'
import { createReservationRoute } from './createReservationRoutes.js'
import { deleteOrCancelReservationRoute } from './deleteOrCancelReservationRoute.js'
import { getReservationsByUserRoute } from './getReservationsByUserRoute.js'
import { getReservationsRoute } from './getReservationsRoute.js'
import { updateReservationRoute } from './updateReservationRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function reservationRoutes(app: FastifyInstance) {
  app.register(getReservationsRoute)
  app.register(getReservationsByUserRoute)
  app.register(createReservationRoute)

  app.register(updateReservationRoute)
  app.register(changeReservationBookRoute)
  app.register(deleteOrCancelReservationRoute)
}
