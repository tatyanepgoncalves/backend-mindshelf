import { z } from 'zod'

export const getBooksSchema = {
  tags: ['Livros'],
  summary: 'Obter livros',
  description: 'Endpoint para obter a lista de livros.',
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    genreIds: z
      .union([z.array(z.string().uuid()), z.string().uuid()])
      .optional(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      books: z.array(
        z.object({
          id: z.string().uuid(),
          title: z.string(),
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

export type GetBooksQuerySchema = z.infer<typeof getBooksSchema.querystring>
