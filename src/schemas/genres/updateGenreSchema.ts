import { z } from 'zod'

export const updateGenreSchema = {
  tags: ['Gêneros Literários'],
  summary: 'Atualiza ou restaura gênero literário pelo id',
  description:
    'Permite atualização de gêneros por ADMIN ou VOLUNTARIO e restauração exclusiva por ADMIN.',
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    restore: z.boolean().optional(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      genreUpdated: z.object({
        id: z.string().uuid(),
        name: z.string().min(3).max(100),
        createdAt: z.string(),
        updatedAt: z.string().nullable(),
        deletedAt: z.string().nullable(),
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

export type UpdateGenreParams = z.infer<typeof updateGenreSchema.params>
export type UpdateGenreBody = z.infer<typeof updateGenreSchema.body>
