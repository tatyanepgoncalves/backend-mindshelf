import type { FastifyInstance } from 'fastify'
import { createReservationRoute } from './createReservationRoutes.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function reservationRoutes(app: FastifyInstance) {
  app.register(createReservationRoute)
}
