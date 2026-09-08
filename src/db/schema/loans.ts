import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { loansStatusEnum } from './enums.js'
import { users } from './users.js'

export const loans = pgTable('loans', {
  id: uuid('id').primaryKey().defaultRandom(),
  readerId: uuid('reader_id')
    .references(() => users.id)
    .notNull(),

  status: loansStatusEnum('status').default('ATIVO'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(), // Data de empréstimo realizado
  updatedAt: timestamp('updated_at', { withTimezone: true }), // Data da última atualização do empréstimo
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Data de exclusão
})
