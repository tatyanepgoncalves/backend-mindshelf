import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  DB_TIMEZONE: z.string().default("America/Sao_Paulo"),
  DB_TZ: z.string().default("America/Sao_Paulo"),
})

export const env = envSchema.parse(process.env)
