import type { FastifyInstance } from 'fastify'
import { createGenreRoute } from './createGenreRoute.js'
import { getGenresRoute } from './getGenresRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function genresRoutes(app: FastifyInstance) {
  app.register(getGenresRoute)
  app.register(createGenreRoute)
}
