import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { LoginUserController } from "../../controllers/users/loginUserController.js";
import { loginUserSchema } from "../../schemas/users/loginUserSchema.js";

export const loginUserRoute: FastifyPluginCallbackZod = (app) => {
  const loginUserController = new LoginUserController()

  app.post("/users/session", {
    schema: loginUserSchema,
  }, async(request,reply) => loginUserController.handle(request, reply))
}