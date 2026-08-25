import { z } from 'zod'

export const createReservationSchema = {
  tags: ['Reservas'],
  summary: 'Cria uma nova reserva de livro',
  description: 'Endpoint para um leitor reservar um livro específico.',
  security: [{ bearerAuth: [] }],
  body: z.object({
    readerId: z.string().uuid(),
    bookId: z.string().uuid(),
    reservationDate: z.string().optional(),
  }),
  response: {
    201: z.object({
      message: z.string(),
      reservation: z.object({
        id: z.string().uuid(),
        reader: z.object({
          id: z.string().uuid(),
          name: z.string(),
          contact: z.object({
            email: z.string().email(),
            phone: z.string().optional(),
            address: z.string().optional(),
          }),
        }),
        book: z.object({
          id: z.string().uuid(),
          title: z.string(),
          author: z.string(),
          publisher: z.string(),
          synopsis: z.string().nullable(),
          coverUrl: z.string().nullable(),
          locationLibrary: z.string().nullable(),
          isbn: z.string().optional(),
        }),
        status: z.string(),
        reservationDate: z.string().nullable(),
        createdAt: z.string(),
      }),
    }),
    400: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type CreateReservationBodySchema = z.infer<
  typeof createReservationSchema.body
>
