import { FastifyReply, FastifyRequest } from "fastify";
import { LogoutUserService } from "../../services/users/logoutUserService.js";
import { UserNotFoundError } from "../../services/users/loginUserService.js";

export class LogoutUserController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    try {
      // Get the user ID from the request
      const userId = request.user?.id

      const logoutUserService = new LogoutUserService()
  
      const result = await logoutUserService.execute(userId)
      return reply.send(result)
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.status(400).send({ message: error.message });
      }
      return reply.status(500).send({ message: "Ocorreu um erro inesperado." });
    }

  }
}