import type { FastifyReply, FastifyRequest } from 'fastify'
import type { LoginUserSchema } from '../../schemas/users/loginUserSchema.js'
import {
  CredentialsInvalidError,
  LoginUserService,
  UserNotFoundError,
} from '../../services/users/loginUserService.js'

export class LoginUserController {
  async handle(
    request: FastifyRequest<{ Body: LoginUserSchema }>,
    reply: FastifyReply
  ) {
    try {
      const loginUserService = new LoginUserService()

      const result = await loginUserService.execute(request.body)

      return reply.status(200).send(result)

      // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    } catch (error: any) {
      if (error instanceof CredentialsInvalidError) {
        return reply.status(401).send({ message: error.message })
      }

      if (error instanceof UserNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      return reply.status(400).send({ message: 'Erro ao realizar login.' })
    }
  }
}
