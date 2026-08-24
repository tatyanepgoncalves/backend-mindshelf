import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const loans = pgTable('loans', {
  id: uuid('id').primaryKey().defaultRandom(),
  readerId: uuid('reader_id')
    .references(() => users.id)
    .notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(), // Data de empréstimo realizado
  updatedAt: timestamp('updated_at', { withTimezone: true }), // Data da última atualização do empréstimo
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Data de exclusão
})
