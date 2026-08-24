import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { GetLoansController } from '../../controllers/loans/getLoansController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeAdminOrVolunteer } from '../../middlewares/authorizeAdminOrVolunteer.js'
import { getLoansSchema } from '../../schemas/loans/getLoansSchema.js'

export const getLoansRoute: FastifyPluginCallbackZod = (app) => {
  const getLoansController = new GetLoansController()

  app.get(
    '/loans',
    {
      preHandler: [authMiddleware, authorizeAdminOrVolunteer],
      schema: getLoansSchema,
    },
    async (request, reply) => getLoansController.handle(request, reply)
  )
}
