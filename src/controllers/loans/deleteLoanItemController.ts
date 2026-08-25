import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  DeleteLoanItemParamsSchema,
  DeleteLoanItemQuerySchema,
} from '../../schemas/loans/deleteLoanItemSchema.js'
import {
  DeleteLoanItemService,
  LoanItemNotFoundError,
} from '../../services/loans/deleteLoanItemService.js'

export class DeleteLoanItemController {
  async handle(
    request: FastifyRequest<{
      Params: DeleteLoanItemParamsSchema
      Querystring: DeleteLoanItemQuerySchema
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const { hardDelete } = request.query
    const deleteLoanItemService = new DeleteLoanItemService()

    try {
      const result = await deleteLoanItemService.execute(id, hardDelete)
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof LoanItemNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Erro interno do servidor.' })
    }
  }
}
