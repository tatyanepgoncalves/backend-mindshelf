import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  DB_TIMEZONE: z.string().default('America/Sao_Paulo'),
  DB_TZ: z.string().default('America/Sao_Paulo'),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  REDIS_URL: z.string(),
})

export const env = envSchema.parse(process.env)
