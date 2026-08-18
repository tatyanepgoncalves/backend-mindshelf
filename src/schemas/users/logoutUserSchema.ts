import { z } from "zod"

export const logoutUserSchema = {
  description: "Realiza o logout do usuário autenticado",
  summary: 'Realiza o logout do usuário autenticado',
  tags: ['Autenticação'],
  response: {
    200: z.object({
      message: z.string(),
      userId: z.string(),
    }),
    404: z.object({
      message: z.string(),
    }),
    500: z.object({
      message: z.string(),
    }),
  },
  security: [{ bearerAuth: [] }],     
}