import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { UpdateStatusLoanByIdController } from '../../controllers/loans/updateStatusLoanByIdController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { authorizeAdminOrVolunteer } from '../../middlewares/authorizeAdminOrVolunteer.js'
import { updateStatusLoanByIdSchema } from '../../schemas/loans/updateStatusLoanByIdSchema.js'

export const updateStatusLoanByIdRoute: FastifyPluginCallbackZod = (app) => {
  const updateStatusLoanByIdController = new UpdateStatusLoanByIdController()

  app.patch(
    '/loans/:id/status',
    {
      preHandler: [authMiddleware, authorizeAdminOrVolunteer],
      schema: updateStatusLoanByIdSchema,
    },
    async (request, reply) =>
      updateStatusLoanByIdController.handle(request, reply)
  )
}
