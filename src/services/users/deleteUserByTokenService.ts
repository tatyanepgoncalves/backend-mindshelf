import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import { UserNotFoundError } from './error.js'

export class DeleteUserByTokenService {
  async execute(userId: string) {
    const user = await db.query.users.findFirst({
      where: and(eq(schema.users.id, userId), isNull(schema.users.deletedAt)),
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    await db.delete(schema.users).where(eq(schema.users.id, userId))

    await db
      .delete(schema.authTokens)
      .where(eq(schema.authTokens.userId, userId))

    return {
      message: `${user.name} deletado com sucesso!`,
      user: {
        deletedAt: formatRelativeTime(new Date()),
        id: user.id,
        name: user.name,
      },
    }
  }
}
