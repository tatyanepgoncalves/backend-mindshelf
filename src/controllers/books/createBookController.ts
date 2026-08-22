import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateBookBodySchema } from '../../schemas/books/createBookSchema.js'
import {
  BookAlreadyRegisterError,
  CreateBookService,
} from '../../services/books/createBookService.js'

export class CreateBookController {
  async handle(
    request: FastifyRequest<{ Body: CreateBookBodySchema }>,
    reply: FastifyReply
  ) {
    try {
      const createBookController = new CreateBookService()

      const result = await createBookController.execute(request.body)

      console.log(result)

      return reply.status(201).send(result)

      // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    } catch (error: any) {
      if (error instanceof BookAlreadyRegisterError) {
        return reply.status(409).send({ message: error.message })
      }

      console.log(error.message)

      if (error.code === '23505') {
        return reply.status(409).send({
          message: 'Conflito de dados: Este registro já existe.',
        })
      }

      return reply.status(500).send({
        message: 'Erro interno ao processar o cadastro.',
      })
    }
  }
}
