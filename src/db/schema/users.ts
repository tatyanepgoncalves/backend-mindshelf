import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { roleEnum } from './enums.js'

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique(),
  telefone: text("telefone").unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("LEITOR").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});