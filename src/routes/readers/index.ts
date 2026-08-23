import type { FastifyInstance } from 'fastify'
import { getReaderBySlugRoute } from './getReaderBySlugRoute.js'
import { getReadersRoute } from './getReadersRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function readerRoutes(app: FastifyInstance) {
  app.register(getReadersRoute)
  app.register(getReaderBySlugRoute)
}
