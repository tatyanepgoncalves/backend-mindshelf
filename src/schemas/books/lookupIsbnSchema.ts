import { z } from 'zod'

export const lookupIsbnSchema = {
  tags: ['Livros'],
  summary: 'Buscar dados de livro por ISBN',
  description:
    'Consulta external APIs (BrasilAPI / OpenLibrary) para auto-preenchimento.',
  security: [{ bearerAuth: [] }],
  params: z.object({
    isbn: z.string().min(10).max(13),
  }),
  response: {
    200: z.object({
      title: z.string(),
      author: z.string(),
      publisher: z.string().nullable(),
      year: z.string().nullable(),
      synopsis: z.string().nullable(),
      coverUrl: z.string().nullable(),
      isbn: z.string(),
    }),
    404: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type LookupIsbnParamsSchema = z.infer<typeof lookupIsbnSchema.params>
