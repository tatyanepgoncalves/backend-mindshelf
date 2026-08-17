import { FastifyReply, FastifyRequest } from "fastify"
import { CreateUserService, UserAlreadyExistsError } from "../../services/users/createUserService.js"
import { CreateUserSchema } from "../../schemas/users/createUserSchema.js"

export class CreateUserController {
  async handle(request: FastifyRequest<{ Body: CreateUserSchema }>, reply: FastifyReply) {
    try {
      const createUserService = new CreateUserService()

      const result = await createUserService.execute(request.body)

      return reply.status(201).send(result)
    } catch (error: any) {

      if (error instanceof UserAlreadyExistsError) {
        return reply.status(409).send({ message: error.message })
      }

      
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