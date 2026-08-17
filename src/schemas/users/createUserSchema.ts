import { z } from "zod"

export const createUserSchema = {
  summary: "Cria um novo usuário",
  description: "Cadastra um novo usuário no sistema",
  tags: ["Autenticação"],
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(255),
    phone: z.string().min(10).max(20).optional(),
    password: z.string().min(8).max(100), 
  }),
  response: {
    201: z.object({
      message: z.string(),
      token: z.string(),
      user: z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(100),
        email: z.string().email().max(255),
        phone: z.string().min(10).max(20).nullable().optional(),
        createdAt: z.string(),
      }),
    }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  }
}

export type CreateUserSchema = z.infer<typeof createUserSchema.body>