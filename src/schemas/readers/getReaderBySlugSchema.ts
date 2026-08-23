import { z } from 'zod'

export const getReaderBySlugSchema = {
  tags: ['Leitores'],
  summary: 'Obter leitor por slug',
  description: 'Endpoint para obter as informações de um leitor pelo slug',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      reader: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email().nullable(),
        phone: z.string().nullable(),
        address: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        summary: z.object({
          activeLoansCount: z.number(),
          activeReservationCount: z.number(),
          hasActiveLoans: z.boolean(),
          hasActiveReservations: z.boolean(),
        }),
        createdAt: z.union([z.string(), z.date()]).nullable().optional(),
        updatedAt: z.union([z.string(), z.date()]).nullable().optional(),
        deletedAt: z.union([z.string(), z.date()]).nullable().optional(),
      }),
      reservations: z.array(
        z.object({
          id: z.string().uuid(),
          book: z.object({
            id: z.string().uuid(),
            title: z.string(),
            author: z.string(),
            slug: z.string(),
          }),
          status: z.string(),
          reservationDate: z
            .union([z.string(), z.date()])
            .nullable()
            .optional(),
          reservedAt: z.union([z.string(), z.date()]).nullable().optional(),
          createdAt: z.union([z.string(), z.date()]).nullable().optional(),
          updatedAt: z.union([z.string(), z.date()]).nullable().optional(),
          deletedAt: z.union([z.string(), z.date()]).nullable().optional(),
        })
      ),
      loans: z.array(
        z.object({
          id: z.string().uuid(),
          book: z.object({
            id: z.string().uuid(),
            title: z.string(),
            author: z.string(),
            slug: z.string(),
          }),
          status: z.string(),
          dueDate: z.union([z.string(), z.date()]).nullable().optional(),
          returnDate: z.union([z.string(), z.date()]).nullable().optional(),
          createdAt: z.union([z.string(), z.date()]).nullable().optional(),
          updatedAt: z.union([z.string(), z.date()]).nullable().optional(),
          deletedAt: z.union([z.string(), z.date()]).nullable().optional(),
        })
      ),
    }),
    400: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type GetReaderBySlugParamsSchema = z.infer<
  typeof getReaderBySlugSchema.params
>
