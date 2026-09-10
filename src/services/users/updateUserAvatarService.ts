import { eq } from 'drizzle-orm'
import { redis } from '../../config/ioredis.js'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { UserNotFoundError } from './error.js'

export class UpdateUserAvatarService {
  async execute(userId: string, imageUrl: string | null) {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    // Limpa o cache do Redis
    await redis.del(`user-session:${userId}`)

    // Atualiza estritamente a propriedade image
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        image: imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
      .returning()

    return {
      message: 'Foto de perfil atualizada com sucesso!',
      user: updatedUser,
    }
  }
}
