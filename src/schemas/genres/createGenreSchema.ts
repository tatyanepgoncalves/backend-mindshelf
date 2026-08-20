import { z } from 'zod'

export const createGenreSchema = {
  tags: ['Gêneros Literários'],
  summary: 'Criar um novo gênero',
  description: 'Cadastra um novo gênero no sistema.',
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: z.string().min(2).max(100),
  }),
  response: {
    201: z.object({
      message: z.string().optional(),
      genre: z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(100),
        createdAt: z.string(),
      }),
    }),
    400: z.object({
      message: z.string(),
    }),
    401: z.object({
      message: z.string(),
    }),
    403: z.object({
      message: z.string(),
    }),
    409: z.object({
      message: z.string(),
    }),
    500: z.object({
      message: z.string(),
    }),
  },
}

export type CreateGenreSchema = z.infer<typeof createGenreSchema.body>
