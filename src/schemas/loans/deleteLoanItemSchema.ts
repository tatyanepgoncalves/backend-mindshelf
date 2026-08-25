import { z } from 'zod'

export const deleteLoanItemSchema = {
  tags: ['Empréstimos'],
  summary: 'Cancela ou remove um item de empréstimo',
  description:
    'Realiza a exclusão lógica (cancela e preenche deletedAt) ou a exclusão física (remove do banco se hardDelete=true).',
  security: [{ bearerAuth: [] }],
  params: z.object({
    id: z.string().uuid(),
  }),
  querystring: z.object({
    hardDelete: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
  response: {
    200: z.object({
      message: z.string(),
    }),
    400: z.object({ message: z.string() }),
    404: z.object({ message: z.string() }),
    500: z.object({ message: z.string() }),
  },
}

export type DeleteLoanItemParamsSchema = z.infer<
  typeof deleteLoanItemSchema.params
>
export type DeleteLoanItemQuerySchema = z.infer<
  typeof deleteLoanItemSchema.querystring
>
