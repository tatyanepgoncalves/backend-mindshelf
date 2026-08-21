import type { FastifyInstance } from 'fastify'
import { createGenreRoute } from './createGenreRoute.js'
import { deleteGenreByIdRoute } from './deleteGenreByIdRoute.js'
import { getGenresRoute } from './getGenresRoute.js'
import { updateGenreRoute } from './updateGenreRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function genresRoutes(app: FastifyInstance) {
  app.register(getGenresRoute)
  app.register(createGenreRoute)
  app.register(updateGenreRoute)

  app.register(deleteGenreByIdRoute)
}
