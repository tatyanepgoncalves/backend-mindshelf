import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { DeleteLoanItemController } from '../../controllers/loans/deleteLoanItemController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeAdminOrVolunteer } from '../../middlewares/authorizeAdminOrVolunteer.js'
import { deleteLoanItemSchema } from '../../schemas/loans/deleteLoanItemSchema.js'

export const deleteLoanItemRoute: FastifyPluginCallbackZod = (app) => {
  const controller = new DeleteLoanItemController()

  app.delete(
    '/loans/items/:id',
    {
      preHandler: [authMiddleware, authorizeAdminOrVolunteer],
      schema: deleteLoanItemSchema,
    },
    async (request, reply) => controller.handle(request, reply)
  )
}
