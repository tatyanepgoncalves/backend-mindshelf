import { eq } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { schema } from "../../db/schema/index.js";
import { UserNotFoundError } from "./loginUserService.js";
import { redis } from "../../config/ioredis.js";

export class LogoutUserService {
  async execute(userId: string) {
    // Check if user exists 
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    })

    if (!user) {
      throw new UserNotFoundError()
    }

    // Remove token 
    await db.delete(schema.authTokens).where(eq(schema.authTokens.userId, userId))

    // Remove user from cache (assuming you have a caching mechanism)
    const cacheKey = `user:${userId}`
    await redis.del(cacheKey)

    return {
      message: `${user.name} deslogado com sucesso. Até a próxima!`,
      userId: user.id,
    }
  }
}