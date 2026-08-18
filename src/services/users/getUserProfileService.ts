import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatPhone, formatRelativeTime } from '../../lib/utils.js'
import { UserNotFoundError } from './loginUserService.js'

export class GetUserProfileService {
  async execute(userId: string) {
    return await db.transaction(async (tx) => {
      const user = await tx.query.users.findFirst({
        where: eq(schema.users.id, userId),
      })

      if (!user) {
        throw new UserNotFoundError()
      }

      return {
        message: 'Perfil do usuário encontrado com sucesso.',
        user: {
          address: user.address ? user.address : null,
          createdAt: user.createdAt
            ? formatRelativeTime(user.createdAt)
            : user.createdAt,
          email: user.email ? user.email : null,
          id: user.id,
          image: user.image ? user.image : null,
          name: user.name,
          phone: user.phone ? formatPhone(user.phone) : null,
          role: user.role,
          updatedAt: user.updatedAt ? formatRelativeTime(user.updatedAt) : null,
        },
      }
    })
  }
}
