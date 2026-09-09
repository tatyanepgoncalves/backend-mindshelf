import { z } from 'zod'

export const getLastBooksSchema = {
  tags: ['Livros'],
  summary: 'Obter os últimos livros adicionados',
  description: 'Endpoint para obter a lista de livros.',
  querystring: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(3),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      books: z.array(
        z.object({
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
        })
      ),
    }),
    400: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type GetLastBooksQuerySchema = z.infer<
  typeof getLastBooksSchema.querystring
>
