import { z } from 'zod'

export const deleteReaderBySlugSchema = {
  tags: ['Leitores'],
  description: 'Deleta um leitor pelo slug de autenticação',
  summary: 'Remove um leitor',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      reader: z.object({
        id: z.string().uuid(),
        name: z.string().min(3).max(255),
        deletedAt: z.string(),
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

export type DeleteReaderBySlugParamsSchema = z.infer<
  typeof deleteReaderBySlugSchema.params
>
