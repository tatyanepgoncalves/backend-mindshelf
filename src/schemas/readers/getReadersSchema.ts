import { z } from 'zod'

export const getReadersSchema = {
  tags: ['Leitores'],
  summary: 'Obter leitores',
  description: 'Endpoint para obter a lista de leitores.',
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    name: z.string().optional(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      readers: z.array(
        z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email().nullable(),
        phone: z.string().nullable(),
        image: z.string().nullable().optional(),
        summary: z.object({
          activeLoansCount: z.number(),
          activeReservationCount: z.number(),
          hasActiveLoans: z.boolean(),
          hasActiveReservations: z.boolean(),
        }),
      })
      ),
    }),
    400: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type GetReadersQuerySchema = z.infer<typeof getReadersSchema.querystring>
