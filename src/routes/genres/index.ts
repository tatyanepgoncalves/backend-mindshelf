import type { FastifyInstance } from 'fastify'
import { createGenreRoute } from './createGenreRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function genresRoutes(app: FastifyInstance) {
  app.register(createGenreRoute)
}
