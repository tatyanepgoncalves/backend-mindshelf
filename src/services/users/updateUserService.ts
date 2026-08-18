import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { redis } from '../../config/ioredis.js'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatPhone, formatRelativeTime } from '../../lib/utils.js'
import type { UpdateUserBodySchema } from '../../schemas/users/updateUserSchema.js'
import { UserNotFoundError } from './loginUserService.js'

export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Usuário com email ou telefone já cadastrado.')
  }
}

export class UpdateUserService {
  async execute(userId: string, data: UpdateUserBodySchema) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    // Prepara os dados para atualização dinamicamente
    // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (data.name) {
      updateData.name = data.name
    }
    if (data.email) {
      updateData.email = data.email
    }
    if (data.phone) {
      updateData.phone = data.phone
    }
    if (data.image) {
      updateData.image = data.image
    }
    if (data.address) {
      updateData.address = data.address
    }

    // Realiza o hash se uma nova senha for informada
    if (data.password) {
      updateData.password = await hash(data.password, 10)
    }

    // Limpa ou atualiza o cache da sessão no Redis
    const cacheKey = `user-session:${userId}`
    await redis.del(cacheKey)

    // Atualiza o usuário e retorna o registro modificado
    const [updatedUser] = await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, userId))
      .returning()

    return {
      message: `${user.name ?? 'Usuário'} atualizado com sucesso!`,
      user: {
        address: updatedUser.address,
        email: updatedUser.email,
        id: updatedUser.id,
        image: updatedUser.image,
        name: updatedUser.name,
        phone: updatedUser.phone
          ? formatPhone(updatedUser.phone)
          : updatedUser.phone,
        updatedAt: updatedUser.updatedAt
          ? formatRelativeTime(updatedUser.updatedAt)
          : updatedUser.updatedAt,
      },
    }
  }
}
