import { randomUUID } from 'node:crypto'
import { compare } from 'bcryptjs'
import { and, eq, isNull } from 'drizzle-orm'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { redis } from '../../config/ioredis.js'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatPhone, formatRelativeTime } from '../../lib/utils.js'
import type { LoginUserSchema } from '../../schemas/users/loginUserSchema.js'

export class CredentialsInvalidError extends Error {
  constructor() {
    super('Credenciais de acesso inválidas. Tente novamente.')
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('Usuário com as credenciais fornecidas não encontrado.')
  }
}

export class LoginUserService {
  async execute({ email, password }: LoginUserSchema) {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: and(eq(schema.users.email, email), isNull(schema.users.deletedAt)),
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    const passwordValid = await compare(password, user.password)

    if (!passwordValid) {
      throw new CredentialsInvalidError()
    }

    // Generate a new token with JWT
    const newToken = jwt.sign(
      {
        email: user.email,
        phone: user.phone,
      },
      env.JWT_SECRET,
      { expiresIn: '10d', subject: user.id }
    )

    // Remove the old token
    await db
      .delete(schema.authTokens)
      .where(eq(schema.authTokens.userId, user.id))

    // Create a new refresh token
    const refreshToken = randomUUID()
    const expiredAt = new Date()
    expiredAt.setDate(expiredAt.getDate() + 10) // Expires in 10 days

    await db.insert(schema.authTokens).values({
      expiredAt,
      token: refreshToken,
      userId: user.id,
    })

    // Save in the Redis (300ms = 5 minutes)
    const cacheKey = `user-session:${user.id}`
    const userDate = {
      email: user.email,
      id: user.id,
      phone: user.phone,
    }

    await redis.set(cacheKey, JSON.stringify(userDate), 'EX', 300) // Expire in 5 minutes

    return {
      message: `Bem-vindo de volta, ${user.name}!`,
      token: newToken,
      user: {
        createdAt: user.createdAt
          ? formatRelativeTime(user.createdAt)
          : user.createdAt,
        email: user.email,
        id: user.id,
        name: user.name,
        phone: user.phone ? formatPhone(user.phone) : null,
      },
    }
  }
}
