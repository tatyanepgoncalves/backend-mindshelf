import type { FastifyInstance } from 'fastify'
import { createBookRoute } from './createBookRoute.js'
import { getBookBySlugRoute } from './getBookBySlugRoute.js'
import { getBooksRoute } from './getBooksRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function booksRoutes(app: FastifyInstance) {
  app.register(getBooksRoute)
  app.register(getBookBySlugRoute)
  app.register(createBookRoute)
}
