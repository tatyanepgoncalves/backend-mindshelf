import { eq } from "drizzle-orm"
import { db } from "../../db/connection.js"
import { CreateUserSchema } from "../../schemas/users/createUserSchema.js"
import { schema } from "../../db/schema/index.js"
import { hash } from "bcryptjs"
import jwt from "jsonwebtoken"
import { env } from "../../config/env.js"
import { formatPhone, formatRelativeTime } from "../../lib/utils.js"


// Erro personalizado para capturar o conflito de email e telefone (HTTP 409)
export class UserAlreadyExistsError extends Error {
  constructor() {
    super("Usuário com email ou telefone já existe.")
  }
}

export class CreateUserService {
  async execute({ name, email, phone, password }: CreateUserSchema) {

    // Executa tudo dentro de uma transação isolada
    return await db.transaction(async (tx) => {
      // Check if user already exists
      const userExists = await tx.query.users.findFirst({
        where: eq(schema.users.email, email)
      })
  
      if (userExists) {
        throw new UserAlreadyExistsError()
      }
      
      // Password hash
      const passwordHash = await hash(password, 10)

    
      // Create user
      const [user] = await tx.insert(schema.users).values({
        name,
        email,
        phone: formatPhone(phone),
        password: passwordHash
      }).returning()
  
      // Generate token
      const token = jwt.sign({ 
        id: user.id,
        email: user.email,
        phone: user.phone,
        }, env.JWT_SECRET, { expiresIn: '10d' })
  
      await tx.insert(schema.authTokens).values({
        userId: user.id,
        token,
        expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      return { 
        message: `Usuário ${user.name} criado com sucesso! Bem-vindo(a) ao sistema.`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone ? formatPhone(user.phone) : user.phone,
          createdAt: user.createdAt ? formatRelativeTime(user.createdAt) : user.createdAt,
        }
      }
    })

  }
}