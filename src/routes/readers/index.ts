import type { FastifyInstance } from 'fastify'
import { getReaderBySlugRoute } from './getReaderBySlugRoute.js'
import { getReadersRoute } from './getReadersRoute.js'
import { updateReaderBySlugRoute } from './updateReaderBySlugRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function readerRoutes(app: FastifyInstance) {
  app.register(getReadersRoute)
  app.register(getReaderBySlugRoute)
  app.register(updateReaderBySlugRoute)
}
