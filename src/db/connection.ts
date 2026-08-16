import 'dotenv/config'
import postgres from 'postgres'
import { env } from '../config/env.js'
import { schema } from './schema/index.js'
import { drizzle } from "drizzle-orm/postgres-js"

export const pg = postgres(env.DATABASE_URL)
export const db = drizzle(pg, {
  schema,
  casing: "snake_case", 
})