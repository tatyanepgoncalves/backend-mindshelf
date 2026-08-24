import { z } from 'zod'

export const createLoanSchema = {
  tags: ['Empréstimos'],
  summary: 'Cria novos empréstimos',
  description:
    'Cria um ou mais empréstimos de livros para um leitor específico, permitindo registro retroativo.',
  security: [{ bearerAuth: [] }],
  body: z.object({
    readerId: z.string().uuid(),
    books: z
      .array(
        z.object({
          bookId: z.string().uuid(),
          dueDays: z.number().positive().int().min(1).max(30).default(7),
          // Permite enviar uma data para retroagir o empréstimo
          issuedAt: z.string().optional(),
        })
      )
      .min(1, 'Informe ao menos um livro para empréstimo.'),
  }),
  response: {
    201: z.object({
      message: z.string().optional(),
      loans: z.array(
        z.object({
          id: z.string().uuid(),
          book: z.array(
            z.object({
              id: z.string().uuid(),
              title: z.string(),
              author: z.string(),
            })
          ),
          reader: z.object({
            id: z.string().uuid(),
            name: z.string(),
          }),
          status: z.enum(['ATIVO', 'DEVOLVIDO', 'ATRASADO', 'CANCELADO']),
          dueDate: z.string(),
          returnDate: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string().nullable(),
          deletedAt: z.string().nullable(),
        })
      ),
    }),
    400: z.object({ message: z.string() }),
    401: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    409: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type CreateLoanBodySchema = z.infer<typeof createLoanSchema.body>
