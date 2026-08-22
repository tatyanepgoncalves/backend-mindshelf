import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { CreateUserSchema } from '../../schemas/users/createUserSchema.js'

// Erro personalizado para capturar o conflito de email e telefone (HTTP 409)
export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Usuário com email ou telefone já existe.')
  }
}

export class CreateUserService {
  async execute({ name, email, password, role }: CreateUserSchema) {
    // Executa tudo dentro de uma transação isolada
    return await db.transaction(async (tx) => {
      // Check if user already exists
      const userExists = await tx.query.users.findFirst({
        where: eq(schema.users.email, email),
      })

      if (userExists) {
        throw new UserAlreadyExistsError()
      }

      // Password hash
      const passwordHash = await hash(password, 10)

      // Create user
      const [user] = await tx
        .insert(schema.users)
        .values({
          email,
          name,
          password: passwordHash,
          role,
        })
        .returning()

      // Generate token
      const token = jwt.sign(
        {
          email: user.email,
          id: user.id,
        },
        env.JWT_SECRET,
        { expiresIn: '10d' }
      )

      await tx.insert(schema.authTokens).values({
        expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        token,
        userId: user.id,
      })

      return {
        message: `Usuário ${user.name} criado com sucesso! Bem-vindo(a) ao sistema.`,
        token,
        user: {
          createdAt: user.createdAt
            ? formatRelativeTime(user.createdAt)
            : user.createdAt,
          email: user.email,
          id: user.id,
          name: user.name,
          role: user.role,
        },
      }
    })
  }
}
