import { z } from 'zod'

export const createLoanSchema = {
  tags: ['Empréstimos'],
  summary: 'Cria um novo empréstimo com um ou mais livros',
  security: [{ bearerAuth: [] }],
  body: z.object({
    readerId: z.string().uuid(),
    books: z
      .array(
        z.object({
          bookId: z.string().uuid(),
          dueDays: z.number().positive().int().min(1).max(30).default(7),
          issuedAt: z.string().optional(),
        })
      )
      .min(1, 'Informe ao menos um livro para empréstimo.'),
  }),
  response: {
    201: z.object({
      message: z.string().optional(),
      loan: z.object({
        id: z.string().uuid(),
        reader: z.object({
          id: z.string().uuid(),
          name: z.string(),
        }),
        createdAt: z.string(),
        items: z.array(
          z.object({
            id: z.string().uuid(),
            book: z.object({
              id: z.string().uuid(),
              title: z.string(),
              author: z.string(),
            }),
            status: z.enum(['ATIVO', 'DEVOLVIDO', 'ATRASADO', 'CANCELADO']),
            dueDate: z.string(),
            returnDate: z.string().nullable(),
          })
        ),
      }),
    }),
    400: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type CreateLoanBodySchema = z.infer<typeof createLoanSchema.body>
