import { z } from 'zod'

export const getLoansByUserSchema = {
  tags: ['Empréstimos'],
  summary: 'Lista histórico e empréstimos ativos do usuário logado',
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    title: z.string().optional(),
    status: z.enum(['ATIVO', 'DEVOLVIDO', 'ATRASADO', 'CANCELADO']).optional(),
    mes: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
  response: {
    200: z.object({
      message: z.string(),
      loans: z.array(
        z.object({
          id: z.string().uuid(),
          book: z.object({
            id: z.string().uuid(),
            title: z.string(),
            author: z.string(),
            coverUrl: z.string().nullable().optional(),
            isbn: z.string().nullable().optional(),
          }),
          status: z.string(),
          loanDate: z.string(),
          dueDate: z.string(),
          returnDate: z.string().nullable(),
          renewalsCount: z.number(),
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

export type GetLoansByUserQuerySchema = z.infer<
  typeof getLoansByUserSchema.querystring
>
