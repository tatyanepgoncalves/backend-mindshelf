import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { redis } from '../config/ioredis.js'
import { db } from '../db/connection.js'
import { schema } from '../db/schema/index.js'

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    return reply
      .status(401)
      .send({ message: 'Erro na autenticação. Token não fornecido.' })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return reply.status(401).send({ message: 'Formato do token inválido.' })
  }

  // biome-ignore lint/style/useDestructuring: it's necessary
  const token = parts[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      sub?: string
      id?: string
    }
    const userId = decoded.sub || decoded.id

    // Se não houver token para aqui
    if (!userId) {
      return reply
        .status(401)
        .send({ message: 'Token inválido: Identificação do usuário ausente.' })
    }

    const cacheKey = `user-session:${userId}`

    // Tentar buscar no Redis
    const cachedUser = await redis.get(cacheKey)
    let userData: {
      name: string
      email: string
      phone: string
      role: 'LEITOR' | 'ADMIN' | 'VOLUNTARIO'
      address: string
    }

    if (cachedUser) {
      userData = JSON.parse(cachedUser)
    } else {
      // Cache Miss: Buscar no Banco (Drizzle)
      const userFromDb = await db.query.users.findFirst({
        columns: {
          address: true,
          email: true,
          name: true,
          phone: true,
          role: true,
        },
        where: and(eq(schema.users.id, userId), isNull(schema.users.deletedAt)),
      })

      if (!userFromDb) {
        return reply.status(401).send({ message: 'Usuário não encontrado.' })
      }

      userData = {
        address: userFromDb.address ?? null,
        email: userFromDb.email ?? null,
        name: userFromDb.name,
        phone: userFromDb.phone ?? null,
        role: userFromDb.role,
      }

      // Salvar no Redis (expira em 5 minutos / 300 segundos)
      await redis.set(cacheKey, JSON.stringify(userData), 'EX', 300)
    }

    // Injetar o usuário na request
    request.user = {
      address: userData.address ?? '',
      email: userData.email,
      id: userId,
      nome: userData.name,
      phone: userData.phone ?? '',
      role: userData.role,
    }
  } catch (err) {
    console.log(`Auth Error: ${err}`)
    return reply.status(401).send({ message: 'Token inválida ou expirada.' })
  }
}
