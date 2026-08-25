import { z } from 'zod'

export const updateStatusLoanByIdSchema = {
  tags: ['Empréstimos'],
  summary: 'Atualizar o status de um empréstimo pelo id do livro',
  description:
    'Endpoint para atualizar o status de um empréstimo utilizando o id do livro',
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum([
      'ATIVO', // Empréstimo em andamento dentro do prazo
      'ATRASADO', // Empréstimo com data de devolução expirada
      'DEVOLVIDO', // Livro de devolução à biblioteca
    ]),
    returnDate: z.string().optional(),
  }),
  response: {
    200: z.object({
      message: z.string().optional(),
      loan: z.object({
        id: z.string().uuid(),
        status: z.string(),
        returnDate: z.string().nullable(),
        updatedAt: z.string().nullable(),
      }),
    }),
    400: z.object({
      message: z.string(),
    }),
    404: z.object({
      message: z.string(),
    }),
    500: z.object({
      message: z.string(),
    }),
  },
}

export type UpdateStatusLoanByIdParamsSchema = z.infer<
  typeof updateStatusLoanByIdSchema.params
>

export type UpdateStatusLoanByIdBodySchema = z.infer<
  typeof updateStatusLoanByIdSchema.body
>
