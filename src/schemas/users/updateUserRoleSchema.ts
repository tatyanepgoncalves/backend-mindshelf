import { z } from 'zod'

export const updateUserRoleSchema = {
  tags: ['Usuários', 'Leitores'],
  summary: 'Atualiza cargo do usuário.',
  description: 'Atualiza cargo do usuário.',
  security: [
    {
      bearerAuth: [],
    },
  ],
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    role: z.enum(['LEITOR', 'ADMIN', 'VOLUNTARIO']),
    address: z.string().min(3).max(255).optional(),
    email: z.string().email().optional(),
    image: z.string().optional(),
    name: z.string().min(3).max(255).optional(),
    phone: z.string().min(10).max(15).optional(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      user: z.object({
        address: z.string().nullable().optional(),
        email: z.string().email().nullable(),
        id: z.string().uuid(),
        image: z.string().nullable().optional(),
        name: z.string().min(3).max(255),
        phone: z.string().nullable().optional(),
        role: z.enum(['LEITOR', 'ADMIN', 'VOLUNTARIO']).default('LEITOR'),
        updatedAt: z.string().nullable(),
      }),
    }),
    400: z.object({ message: z.string() }),
    401: z.object({ message: z.string() }),
    403: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type UpdateUserRoleParamsSchema = z.infer<
  typeof updateUserRoleSchema.params
>

export type UpdateUserRoleBodySchema = z.infer<typeof updateUserRoleSchema.body>
