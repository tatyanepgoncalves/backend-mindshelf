import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetLoanByIdParamsSchema } from '../../schemas/loans/getLoanByIdSchema.js'
import {
  GetLoanByIdService,
  LoanIdNotFoundError,
} from '../../services/loans/getLoanByIdService.js'

export class GetLoanByIdController {
  async handle(
    request: FastifyRequest<{ Params: GetLoanByIdParamsSchema }>,
    reply: FastifyReply
  ) {
    const getLoanByIdService = new GetLoanByIdService()
    const { id } = request.params

    try {
      const result = await getLoanByIdService.execute(id)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof LoanIdNotFoundError) {
        return reply.status(404).send({
          message: error.message,
        })
      }

      return reply.status(400).send({
        message: 'Erro ao buscar empréstimo solicitado.',
      })
    }
  }
}
