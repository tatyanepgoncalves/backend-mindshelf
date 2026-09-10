import type { FastifyInstance } from 'fastify'
import { createUserRoute } from './createUserRoute.js'
import { deleteUserByTokenRoute } from './deleteUserByTokenRoute.js'
import { getUserProfileRoute } from './getUserProfileRoute.js'
import { loginUserRoute } from './loginUserRoute.js'
import { logoutUserRoute } from './logoutUserRoute.js'
import { updateUserAvatarRoute } from './updateUserAvatarRoute.js'
import { updateUserRoleBySlugRoute } from './updateUserRoleBySlugRoute.js'
import { updateUserRoute } from './updateUserRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function userRoutes(app: FastifyInstance) {
  // ROTAS PÚBLICAS
  app.register(createUserRoute)
  app.register(loginUserRoute)

  // ROTAS COM AUTENTICAÇÃO NECESSÁRIA
  app.register(getUserProfileRoute)
  app.register(updateUserRoute)
  app.register(updateUserAvatarRoute)
  app.register(updateUserRoleBySlugRoute)
  app.register(logoutUserRoute)
  app.register(deleteUserByTokenRoute)
}
