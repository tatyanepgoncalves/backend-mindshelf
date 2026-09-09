import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateLoanBodySchema } from '../../schemas/loans/createLoanSchema.js'
import { CreateLoanService } from '../../services/loans/createLoanService.js'
import {
  BookAlreadyLoanedError,
  BookNotFoundError,
  DuplicateBooksInRequestError,
  LimitExcededLoan,
  MaxLoansExceededError,
  ReaderNotFoundError,
} from '../../services/loans/errors.js'

export class CreateLoanController {
  async handle(
    request: FastifyRequest<{ Body: CreateLoanBodySchema }>,
    reply: FastifyReply
  ) {
    const createLoanService = new CreateLoanService()

    try {
      const result = await createLoanService.execute(request.body)
      return reply.status(201).send(result)
    } catch (error) {
      if (
        error instanceof ReaderNotFoundError ||
        error instanceof BookNotFoundError
      ) {
        return reply.status(404).send({ message: error.message })
      }

      if (
        error instanceof BookAlreadyLoanedError ||
        error instanceof MaxLoansExceededError ||
        error instanceof DuplicateBooksInRequestError ||
        error instanceof LimitExcededLoan
      ) {
        return reply.status(409).send({ message: error.message })
      }

      return reply.status(400).send({
        message: 'Erro ao realizar o empréstimo.',
      })
    }
  }
}
