import { z } from 'zod'

export const updateBookBySlugSchema = {
  tags: ['Livros'],
  summary: 'Atualizar livro',
  description: 'Endpoint para atualizar um livro pelo slug.',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    author: z.string().min(1).max(255).optional(),
    publisher: z.string().min(1).max(255).nullable().optional(),
    year: z.string().min(1).max(4).optional(),
    genreIds: z.array(z.string().uuid()).min(1).optional(),
    synopsis: z.string().nullable().optional(),
    coverUrl: z.string().nullable().optional(),
    isbn: z.string().nullable().optional(),
    locationLibrary: z.string().nullable().optional(),
    restore: z.boolean().optional(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      book: z.object({
        // 👈 Removido z.array()
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
    403: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type UpdateBookBySlugBodySchema = z.infer<
  typeof updateBookBySlugSchema.body
>

export type UpdateBookBySlugParamsSchema = z.infer<
  typeof updateBookBySlugSchema.params
>
