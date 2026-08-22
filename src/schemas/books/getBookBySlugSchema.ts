import { z } from 'zod'

export const getBookBySlugSchema = {
  tags: ['Livros'],
  summary: 'Retorna informações do livros buscado pelo slug.',
  description: '',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      book: z.object({
        id: z.string().uuid(),
        title: z.string(),
        slug: z.string(),
        author: z.string(),
        publisher: z.string().nullable(),
        year: z.union([z.number(), z.string()]),
        genres: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string(),
          })
        ),
        synopsis: z.string().nullable(),
        coverUrl: z.string().nullable(),
        isbn: z.string().nullable(),
        locationLibrary: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string().nullable(),
        deletedAt: z.string().nullable(),
      }),
    }),
    400: z.object({ message: z.string() }),
    401: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type GetBookBySlugParamsSchema = z.infer<
  typeof getBookBySlugSchema.params
>
