import { z } from 'zod'

export const changeReservationBookSchema = {
  tags: ['Reservas'],
  summary: 'Alterar livro de uma reserva',
  description:
    'Endpoint para alterar a data ou o livro associado a uma reserva existente.',
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z
    .object({
      bookId: z.string().uuid(),
      reservationDate: z.string().nullable().optional(),
    })
    .refine((data) => data.bookId || data.reservationDate, {
      message: 'Pelo menos um dos campos deve ser fornecido',
    }),
  response: {
    200: z.object({
      message: z.string().optional(),
      reservation: z.object({
        id: z.string().uuid(),
        readerId: z.string().uuid(),
        bookId: z.string().uuid(),
        reservationDate: z.string().nullable().optional(),
        status: z.string(),
      }),
    }),
    400: z.object({ message: z.string() }),
    403: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type ChangeReservationBookParamsSchema = z.infer<
  typeof changeReservationBookSchema.params
>
export type ChangeReservationBookBodySchema = z.infer<
  typeof changeReservationBookSchema.body
>
