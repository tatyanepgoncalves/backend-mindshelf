import type { FastifyInstance } from 'fastify'
import { getBooksRoute } from './getBooksRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function booksRoutes(app: FastifyInstance) {
  app.register(getBooksRoute)
}
