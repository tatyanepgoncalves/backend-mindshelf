import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { CreateBookController } from '../../controllers/books/createBookController.js'
import { createBookSchema } from '../../schemas/books/createBookSchema.js'

export const createBookRoute: FastifyPluginCallbackZod = (app) => {
  const createBookController = new CreateBookController()

  app.post(
    '/books',
    {
      schema: createBookSchema,
    },
    async (request, reply) => createBookController.handle(request, reply)
  )
}
