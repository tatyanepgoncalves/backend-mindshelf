import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetLoansQuerySchema } from '../../schemas/loans/getLoansSchema.js'
import {
  GetLoansService,
  LoansNotFoundError,
} from '../../services/loans/getLoansService.js'

export class GetLoansController {
  async handle(
    request: FastifyRequest<{ Querystring: GetLoansQuerySchema }>,
    reply: FastifyReply
  ) {
    const getLoansService = new GetLoansService()
    const userRole = request.user?.role
    const isAdmin = userRole === 'ADMIN' || userRole === 'VOLUNTARIO'

    try {
      const result = await getLoansService.execute(request.query, isAdmin)

      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof LoansNotFoundError) {
        return reply.status(404).send({
          message: error.message,
        })
      }

      return reply.status(500).send({
        message: 'Erro interno ao buscar empréstimos.',
      })
    }
  }
}
