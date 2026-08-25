import type { FastifyInstance } from 'fastify'
import { createReservationRoute } from './createReservationRoutes.js'
import { getReservationsRoute } from './getReservationsRoute.js'
import { updateReservationRoute } from './updateReservationRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function reservationRoutes(app: FastifyInstance) {
  app.register(getReservationsRoute)
  app.register(createReservationRoute)

  app.register(updateReservationRoute)
}
