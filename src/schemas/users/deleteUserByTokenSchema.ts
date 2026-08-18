import { z } from 'zod'

export const deleteUserByTokenSchema = {
  tags: ['Usuários'],
  description: 'Deleta um usuário pelo token de autenticação',
  summary: 'Remove um usuário',
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      message: z.string().optional(),
      user: z.object({
        id: z.string().uuid(),
        name: z.string().min(3).max(255),
        deletedAt: z.string(),
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
