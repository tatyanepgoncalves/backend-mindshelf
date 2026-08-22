import { z } from 'zod'

export const createBookSchema = {
  tags: ['Livros'],
  summary: 'Cadastra um novo livro',
  description: 'Cadastra um novo livro no sistema.',
  security: [
    {
      bearerAuth: [],
    },
  ],
  body: z.object({
    title: z.string().min(5).max(255),
    author: z.string().min(5).max(255),
    publisher: z.string().min(2).max(255).nullable(),
    year: z.string().min(1).max(4),
    genreIds: z.array(z.string().uuid()).min(1, 'Informe ao menos um gênero.'),
    synopsis: z.string().nullable(),
    coverUrl: z.string().nullable(),
    isbn: z.string().nullable(),
    locationLibrary: z.string().nullable(),
  }),
  response: {
    201: z.object({
      message: z.string().optional(),
      book: z.object({
        id: z.string().uuid(),
        title: z.string().min(5).max(255),
        author: z.string().min(5).max(255),
        publisher: z.string().min(2).max(255).nullable(),
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

export type CreateBookBodySchema = z.infer<typeof createBookSchema.body>
