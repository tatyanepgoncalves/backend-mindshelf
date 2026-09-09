import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  UpdateStatusLoanByIdBodySchema,
  UpdateStatusLoanByIdParamsSchema,
} from '../../schemas/loans/updateStatusLoanByIdSchema.js'
import { LoanItemNotFoundError } from '../../services/loans/deleteLoanItemService.js'
import { LoanItemAlreadyReturnedError } from '../../services/loans/errors.js'
import { UpdateStatusLoanByIdService } from '../../services/loans/updateStatusLoanByIdService.js'

export class UpdateStatusLoanByIdController {
  async handle(
    request: FastifyRequest<{
      Body: UpdateStatusLoanByIdBodySchema
      Params: UpdateStatusLoanByIdParamsSchema
    }>,
    reply: FastifyReply
  ) {
    const { id } = request.params
    const updateStatusLoanByIdService = new UpdateStatusLoanByIdService()

    // Implementation for updating loan status
    try {
      const result = await updateStatusLoanByIdService.execute(id, request.body)
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof LoanItemNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }
      if (error instanceof LoanItemAlreadyReturnedError) {
        return reply.status(400).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  }
}
