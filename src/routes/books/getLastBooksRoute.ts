import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetLastBooksController } from '../../controllers/books/getLastBooksController.js'
import { getLastBooksSchema } from '../../schemas/books/getLastBooksSchema.js'

export const getLastBooksRoute: FastifyPluginCallbackZod = (app) => {
  const getLastBooksController = new GetLastBooksController()

  app.get(
    '/books/ultimos',
    {
      schema: getLastBooksSchema,
    },
    async (request, reply) => getLastBooksController.handle(request, reply)
  )
}
