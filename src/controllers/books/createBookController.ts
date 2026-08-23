import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateBookBodySchema } from '../../schemas/books/createBookSchema.js'
import {
  BookAlreadyRegisterError,
  CreateBookService,
  IsbnIncorretError,
} from '../../services/books/createBookService.js'

export class CreateBookController {
  async handle(
    request: FastifyRequest<{ Body: CreateBookBodySchema }>,
    reply: FastifyReply
  ) {
    try {
      const createBookController = new CreateBookService()

      const result = await createBookController.execute(request.body)


      return reply.status(201).send(result)

      // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    } catch (error: any) {
      if (error instanceof BookAlreadyRegisterError) {
        return reply.status(409).send({ message: error.message })
      }

      if (error instanceof IsbnIncorretError) {
        return reply.status(409).send({
          message: error.message
        })
      }
    

      return reply.status(500).send({
        message: 'Erro interno ao processar o cadastro.',
      })
    }
  }
}
