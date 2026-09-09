import { eq } from 'drizzle-orm'
import { redis } from '../../config/ioredis.js'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import {
  formatPhone,
  formatRelativeTime,
  generateSlug,
} from '../../lib/utils.js'
import type { UpdateUserRoleBodySchema } from '../../schemas/users/updateUserRoleSchema.js'
import { UserNotFoundError } from './error.js'

export class UserNotAuthoridedError extends Error {
  constructor() {
    super('Usuário não autorizado para realizar modificação.')
  }
}

export class UpdateUserRoleBySlugService {
  async execute(slug: string, data: UpdateUserRoleBodySchema) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.slug, slug),
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
      updateData.slug = generateSlug(data.name)
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
    if (data.role) {
      updateData.role = data.role
    }

    // Limpa ou atualiza o cache da sessão no Redis
    const cacheKey = `user-session:${user.id}`
    await redis.del(cacheKey)

    // Atualiza o usuário e retorna o registro modificado
    const [updatedUser] = await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, user.id))
      .returning()

    return {
      message: `${user.name ?? 'Usuário'} atualizado para ${updatedUser.name ?? 'Usuário'} com sucesso!`,
      user: {
        address: updatedUser.address ?? null,
        email: updatedUser.email,
        id: updatedUser.id,
        image: updatedUser.image ?? null,
        name: updatedUser.name,
        phone: updatedUser.phone ? formatPhone(updatedUser.phone) : null,
        role: updateData.role,
        slug: updatedUser.slug,
        updatedAt: updatedUser.updatedAt
          ? formatRelativeTime(updatedUser.updatedAt)
          : updatedUser.updatedAt,
      },
    }
  }
}
