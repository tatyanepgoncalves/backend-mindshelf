import { z } from 'zod'

export const getLoanByIdSchema = {
  tags: ['Empréstimos'],
  summary: 'Obter empréstimo por ID',
  description: 'Endpoint para obter um empréstimo específico pelo seu ID',
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      loan: z
        .object({
          id: z.string().uuid(),
          reader: z.object({
            id: z.string().uuid(),
            name: z.string(),
            slug: z.string().optional(),
            address: z.string().nullable(),
            phone: z.string().nullable(),
            email: z.string().email(),
          }),
          items: z.array(
            z.object({
              id: z.string().uuid(),
              book: z.object({
                id: z.string().uuid(),
                title: z.string(),
                author: z.string(),
                slug: z.string().optional(),
                coverUrl: z.string().nullable(),
              }),
              status: z.string(),
              dueDate: z.union([z.string(), z.date()]),
              returnDate: z.union([z.string(), z.date()]).nullable(),
            })
          ),
          createdAt: z.union([z.string(), z.date()]),
          updatedAt: z.union([z.string(), z.date()]).nullable().optional(),
          deletedAt: z.union([z.string(), z.date()]).nullable().optional(),
        })
        .nullable(),
    }),
    400: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type GetLoanByIdParamsSchema = z.infer<typeof getLoanByIdSchema.params>
