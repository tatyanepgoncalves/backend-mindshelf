import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetLoanByIdController } from '../../controllers/loans/getLoanByIdController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeAdminOrVolunteer } from '../../middlewares/authorizeAdminOrVolunteer.js'
import { getLoanByIdSchema } from '../../schemas/loans/getLoanByIdSchema.js'

export const getLoanByIdRoute: FastifyPluginCallbackZod = (app) => {
  const getLoanByIdController = new GetLoanByIdController()

  app.get(
    '/loans/:id',
    {
      preHandler: [authMiddleware, authorizeAdminOrVolunteer],
      schema: getLoanByIdSchema,
    },
    async (request, reply) => getLoanByIdController.handle(request, reply)
  )
}
