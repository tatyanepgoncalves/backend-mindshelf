import { z } from 'zod'

export const getLoansByUserSchema = {
  tags: ['Empréstimos'],
  summary: 'Lista histórico e empréstimos ativos do usuário logado',
  security: [{ bearerAuth: [] }],
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
    }),
    404: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}
