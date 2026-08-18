import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { env } from './src/config/env.js'

export default defineConfig({
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: 'postgresql',
  out: './src/db/migrations/',
  schema: './src/db/schema/*.ts',
})
