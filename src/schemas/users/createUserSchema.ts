import { z } from 'zod'

export const createUserSchema = {
  summary: 'Cria um novo usuário',
  description: 'Cadastra um novo usuário no sistema',
  tags: ['Autenticação'],
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(255).optional(),
    phone: z.string().min(10).max(20).optional(),
    password: z.string().min(8).max(100),
    role: z
      .enum(['LEITOR', 'ADMIN', 'VOLUNTARIO'])
      .default('LEITOR')
      .optional(),
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
        role: z.enum(['LEITOR', 'ADMIN', 'VOLUNTARIO']).default('LEITOR'),
        createdAt: z.string(),
      }),
    }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type CreateUserSchema = z.infer<typeof createUserSchema.body>
