import { z } from 'zod'

export const getLoansSchema = {
  tags: ['Empréstimos'],
  summary: 'Obter empréstimos',
  description:
    'Endpoint para obter a lista de empréstimos com filtros opcionais',
  security: [{ bearerAuth: [] }],
  querystring: z.object({
    readerId: z.string().uuid().optional(),
    bookId: z.string().uuid().optional(),
    status: z
      .enum([
        'ATIVO', // Empréstimo em andamento dentro do prazo
        'ATRASADO', // Empréstimo com data de devolução expirada
        'DEVOLVIDO', // Livro de devolução à biblioteca
        'CANCELADO', // Empréstimo cancelado por inconsistência
      ])
      .optional(),
    mes: z.string().optional(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      loans: z.array(
        z.object({
          id: z.string().uuid(),
          reader: z.object({
            id: z.string().uuid(),
            name: z.string(),
          }),
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

export type GetLoansQuerySchema = z.infer<typeof getLoansSchema.querystring>
