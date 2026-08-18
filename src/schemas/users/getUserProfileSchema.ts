import { z } from "zod" 

export const getUserProfileSchema = {
  tags: ['Usuários'],
  summary: "Busca informações do perfil do usuário autenticado.",
  description: "Endpoint para buscar informações do perfil do usuário autenticado.",
  response: {
    200: z.object({
      message: z.string().optional(),
      user: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email().nullable(),
        phone: z.string().nullable(),
        address: z.string().nullable(),
        image: z.string().nullable().optional(),
        role: z.enum(['LEITOR', 'ADMIN', 'VOLUNTARIO']),
        createdAt: z.string(),
        updatedAt: z.string().nullable(),
      }),
    }),
    404: z.object({
      message: z.string(),
    }),
    500: z.object({
      message: z.string(),
    }),
  },
}