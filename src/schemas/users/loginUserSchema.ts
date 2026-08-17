import { z } from "zod";

export const loginUserSchema = {
  tags: ["Autenticação"],
  summary: "Autentica um usuário e retorna um token.",
  description: "Autentica um usuário e retorna um token de acesso.",
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      token: z.string(),
      user: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email().nullable(),
        phone: z.string().min(10).max(15).nullable(),
        createdAt: z.string(),
      }),
    }),
    400: z.object({
      message: z.string(),
    }),
    401: z.object({
      message: z.string(),
    }),
    404: z.object({
      message: z.string(),
    }),
    500: z.object({
      message: z.string(),
    }),
  },
};

export type LoginUserSchema = z.infer<typeof loginUserSchema.body>;