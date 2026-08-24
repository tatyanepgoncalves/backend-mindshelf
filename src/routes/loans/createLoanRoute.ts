import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { CreateLoanController } from '../../controllers/loans/createLoansController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeAdminOrVolunteer } from '../../middlewares/authorizeAdminOrVolunteer.js'
import { createLoanSchema } from '../../schemas/loans/createLoanSchema.js'

export const createLoanRoute: FastifyPluginCallbackZod = (app) => {
  const controller = new CreateLoanController()

  app.post(
    '/loans',
    {
      preHandler: [authMiddleware, authorizeAdminOrVolunteer],
      schema: createLoanSchema,
    },
    async (request, reply) => controller.handle(request, reply)
  )
}
