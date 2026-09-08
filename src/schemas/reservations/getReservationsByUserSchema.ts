import { z } from 'zod'

export const getReservationsByUserSchema = {
  tags: ['Reservas'],
  summary: 'Lista reservas de livros por usuário com filtros opcionais',
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    title: z.string().optional(),
    status: z
      .enum(['PENDENTE', 'NOTIFICADO', 'CUMPRIDO', 'EXPIRADO', 'CANCELADO'])
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
  response: {
    200: z.object({
      message: z.string(),
      reservations: z.array(
        z.object({
          id: z.string().uuid(),
          book: z.object({
            id: z.string().uuid(),
            title: z.string(),
            author: z.string(),
            publisher: z.string().nullable().optional(),
            synopsis: z.string().nullable().optional(),
            coverUrl: z.string().nullable().optional(),
            locationLibrary: z.string().nullable().optional(),
            isbn: z.string().nullable().optional(),
          }),
          reader: z.object({
            id: z.string().uuid(),
            name: z.string(),
            contact: z.object({
              email: z.string().email(),
              phone: z.string().nullable(),
              address: z.string().nullable(),
            }),
          }),
          status: z.string(),
          reservationDate: z.string().nullable(),
          createdAt: z.string(),
        })
      ),
      pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
      }),
    }),
    404: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type GetReservationsByUserQuerySchema = z.infer<
  typeof getReservationsByUserSchema.querystring
>
