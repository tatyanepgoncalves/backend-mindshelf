import { z } from 'zod'

export const getGenreSchema = {
  tags: ['Gêneros Literários'],
  summary: 'Obter gêneros literários',
  description:
    'Endpoint para obter a lista de gêneros literários com filtros opcionais.',
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    name: z.string().max(100).optional(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      genres: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          quantityBooks: z.number().int().min(0),
          createdAt: z.string().nullable(),
          updatedAt: z.string().nullable(),
          deletedAt: z.string().nullable(),
        })
      ),
    }),
    400: z.object({
      message: z.string().optional(),
    }),
    500: z.object({
      message: z.string().optional(),
    }),
  },
}

export type GetGenreQuerySchema = z.infer<typeof getGenreSchema.querystring>
