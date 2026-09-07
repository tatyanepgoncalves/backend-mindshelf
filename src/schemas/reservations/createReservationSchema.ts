import { z } from 'zod'

export const createReservationSchema = {
  tags: ['Reservas'],
  summary: 'Cria uma nova reserva de livro',
  description:
    'Endpoint para reservar um ou mais livros (limite máximo de 3 itens ativos).',
  security: [{ bearerAuth: [] }],
  body: z
    .object({
      readerId: z.string().uuid().optional(),
      bookIds: z.array(z.string().uuid()).optional(),
      slugs: z.union([z.string(), z.array(z.string())]).optional(),
      reservationDate: z.string().optional(),
    })
    .refine((data) => data.bookIds?.length || data.slugs, {
      message: 'É necessário fornecer ao menos um bookId ou slug.',
      path: ['bookIds'],
    }),
  response: {
    201: z.object({
      message: z.string(),
      reservations: z.array(
        z.object({
          id: z.string().uuid(),
          queuePosition: z.number(),
          expiresAt: z.string().nullable(),
          book: z.object({
            id: z.string().uuid(),
            title: z.string(),
            slug: z.string(),
            author: z.string(),
            coverUrl: z.string().nullable(),
          }),
          status: z.string(),
          createdAt: z.string(),
        })
      ),
    }),
    400: z.object({ message: z.string() }),
    403: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type CreateReservationBodySchema = z.infer<
  typeof createReservationSchema.body
>
