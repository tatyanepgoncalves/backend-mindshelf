import type { FastifyInstance } from "fastify"
import { createUserRoute } from "./createUserRoute.js"

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function userRoutes(app: FastifyInstance) {
  // ROTAS PÚBLICAS
  app.register(createUserRoute)
}