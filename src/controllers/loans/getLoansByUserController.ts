import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetLoansByUserQuerySchema } from '../../schemas/loans/getLoansByUserSchema.js'
import { GetLoansByUserService } from '../../services/loans/getLoansByUserService.js'
import { LoansNotFoundError } from '../../services/loans/getLoansService.js'

export class GetLoansByUserController {
  async handle(
    request: FastifyRequest<{ Querystring: GetLoansByUserQuerySchema }>,
    reply: FastifyReply
  ) {
    const getLoansByUserService = new GetLoansByUserService()
    const userId = request.user?.id

    try {
      const result = await getLoansByUserService.execute(userId, request.query)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof LoansNotFoundError) {
        return reply.status(404).send({
          message: error.message,
        })
      }

      return reply.status(400).send({
        message: 'Erro ao buscar empréstimos.',
      })
    }
  }
}
