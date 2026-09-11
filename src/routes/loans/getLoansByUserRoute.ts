import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetLoansByUserController } from '../../controllers/loans/getLoansByUserController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { getLoansByUserSchema } from '../../schemas/loans/getLoansByUserSchema.js'

export const getLoansByUserRoute: FastifyPluginCallbackZod = (app) => {
  const getLoansByUserController = new GetLoansByUserController()

  app.get(
    '/loans/user/:userId',
    {
      preHandler: [authMiddleware],
      schema: getLoansByUserSchema,
    },
    async (request, reply) => getLoansByUserController.handle(request, reply)
  )
}
