import { z } from 'zod'

export const deleteOrCancelReservationSchema = {
  tags: ['Reservas'],
  summary: 'Excluir ou cancelar uma reserva',
  description: 'Endpoint para excluir ou cancelar uma reserva existente.',
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  querystring: z.object({
    cancel: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true'),
    delete: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true'),
  }),
  response: {
    200: z.object({
      message: z.string(),
    }),
    400: z.object({
      message: z.string(),
    }),
    403: z.object({
      message: z.string(),
    }),
    404: z.object({
      message: z.string(),
    }),
  },
}

export type DeleteOrCancelReservationParamsSchema = z.infer<
  typeof deleteOrCancelReservationSchema.params
>

export type DeleteOrCancelReservationQuerystringSchema = z.infer<
  typeof deleteOrCancelReservationSchema.querystring
>
