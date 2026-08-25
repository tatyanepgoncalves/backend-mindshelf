import { z } from 'zod'

export const updateReservationSchema = {
  tags: ['Reservas'],
  summary: 'Atualiza uma reserva existente',
  description: 'Endpoint para atualizar uma reserva existente',
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z
    .object({
      bookId: z.string().uuid().optional(),
      reservationDate: z.string().datetime().nullable().optional(),
      status: z
        .enum(['PENDENTE', 'NOTIFICADO', 'CUMPRIDO', 'EXPIRADO', 'CANCELADO'])
        .optional(),
      expirationDays: z.number().int().min(7).max(30).default(7).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Informe ao menos um campo para atualização.',
    }),
  response: {
    200: z.object({
      message: z.string(),
      reservation: z.object({
        id: z.string().uuid(),
        reader: z.object({
          id: z.string().uuid(),
          name: z.string(),
          contact: z.object({
            email: z.string().email(),
            phone: z.string().nullable().optional(),
            address: z.string().nullable().optional(),
          }),
        }),
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
        status: z.string(),
        reservationDate: z.string().nullable(),
        notifiedAt: z.string().nullable(),
        expiresAt: z.string().nullable(),
        createdAt: z.string(),
      }),
    }),
    400: z.object({ message: z.string() }),
    403: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type UpdateReservationParamsSchema = z.infer<
  typeof updateReservationSchema.params
>
export type UpdateReservationBodySchema = z.infer<
  typeof updateReservationSchema.body
>
