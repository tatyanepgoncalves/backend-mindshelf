import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '../config/env.js'
import { schema } from './schema/index.js'

export const pg = postgres(env.DATABASE_URL, {
  connection: {
    TimeZone: env.DB_TIMEZONE,
  },
  max: 10,
})

export const db = drizzle(pg, {
  schema,
  casing: 'snake_case',
})
