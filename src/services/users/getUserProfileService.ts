import { eq } from "drizzle-orm"
import { db } from "../../db/connection.js"
import { schema } from "../../db/schema/index.js"
import { UserNotFoundError } from "./loginUserService.js"
import { formatPhone, formatRelativeTime } from "../../lib/utils.js"

export class GetUserProfileService {
  async execute(userId: string) {
    return await db.transaction(async (tx) => {

      const user = await tx.query.users.findFirst({
        where: eq(schema.users.id, userId)
      })
  
      if (!user) {
        throw new UserNotFoundError()
      }
  
      return {
        message: "Perfil do usuário encontrado com sucesso.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email ? user.email : null,
          phone: user.phone ? formatPhone(user.phone) : null,
          address: user.address ? user.address : null,
          image: user.image ? user.image : null,
          role: user.role,
          createdAt: user.createdAt ? formatRelativeTime(user.createdAt) : user.createdAt,
          updatedAt: user.updatedAt ? formatRelativeTime(user.updatedAt) : null,
        }
      }
    })

  }

}