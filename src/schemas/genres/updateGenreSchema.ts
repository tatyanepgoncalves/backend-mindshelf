import z from 'zod'

export const updateGenreSchema = {
  tags: ['Gêneros Literários'],
  summary: 'Atualiza genero literário pelo id',
  description:
    'Permite atualização de gêneros literários pelo id sendo usuário ADMIN ou VOLUNTARIO.',
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(3).max(100),
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

    400: z.object({
      message: z.string(),
    }),
    404: z.object({
      message: z.string(),
    }),
    500: z.object({
      message: z.string(),
    }),
  },
}

export type UpdateGenreParams = z.infer<typeof updateGenreSchema.params>
export type UpdateGenreBody = z.infer<typeof updateGenreSchema.body>
