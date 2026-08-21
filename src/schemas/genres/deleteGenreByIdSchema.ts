import { z } from 'zod'

export const deleteGenreByIdSchema = {
  tags: ['Gêneros Literários'],
  description:
    'Deleta um item específico pelo ID via token (Soft delete por padrão ou permanente via query string)',
  summary: 'Remove um gênero literário',
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  querystring: z.object({
    permanente: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true'),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
    }),
    400: z.object({ message: z.string() }),
    401: z.object({ message: z.string() }),
    403: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type DeleteGenreByIdParams = z.infer<typeof deleteGenreByIdSchema.params>
export type DeleteGenreByIdQuerystring = z.infer<
  typeof deleteGenreByIdSchema.querystring
>
