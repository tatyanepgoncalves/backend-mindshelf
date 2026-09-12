import type { FastifyReply, FastifyRequest } from 'fastify'
import { GetLoansByUserService } from '../../services/loans/getLoansByUserService.js'

export class GetLoansByUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const service = new GetLoansByUserService()
    const userId = request.user?.id

    if (!userId) {
      return reply.status(401).send({
        message: 'Usuário não autenticado.',
      })
    }

    try {
      const result = await service.execute(userId)

      return reply.status(200).send(result)
    } catch {
      return reply.status(500).send({
        message: 'Erro interno ao buscar empréstimos.',
      })
    }
  }
}
