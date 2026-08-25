import { z } from 'zod'

export const getReservationsSchema = {
  tags: ['Reservas'],
  summary: 'Lista reservas de livros com filtros opcionais',
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    title: z.string().optional(),
    readerName: z.string().optional(),
    status: z
      .enum([
        'PENDENTE', // Aguardando na fila de espera
        'NOTIFICADO', // Livro ficou disponível e o leitor foi notificado
        'CUMPRIDO', // Reserva convertida em empréstimo
        'EXPIRADO', // Prazo de retirada expirou após notificação
        'CANCELADO', // Cancelada pelo leitor ou administrador
      ])
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

export type GetReservationsQuerySchema = z.infer<
  typeof getReservationsSchema.querystring
>
