import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { LogoutUserController } from "../../controllers/users/logoutUserController.js";
import { logoutUserSchema } from "../../schemas/users/logoutUserSchema.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

export const logoutUserRoute: FastifyPluginCallbackZod = (app) => {
  const logoutUserController = new LogoutUserController()

  app.post("/users/logout", {
    preHandler: [authMiddleware],
    schema: logoutUserSchema
  }, async (request, reply) => logoutUserController.handle(request, reply))
}