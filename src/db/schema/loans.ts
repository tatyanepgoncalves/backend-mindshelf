import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { books } from './books.js'
import { loansStatusEnum } from './enums.js'
import { users } from './users.js'

export const loans = pgTable('loans', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookId: uuid('book_id')
    .references(() => books.id)
    .notNull(),
  readerId: uuid('reader_id')
    .references(() => users.id)
    .notNull(),
  status: loansStatusEnum('status').default('ATIVO').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(), // Data de devolução prevista
  returnDate: timestamp('return_date', { withTimezone: true }), // Data de devolução evetuada
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(), // Data de empréstimo realizado
  updatedAt: timestamp('updated_at', { withTimezone: true }), // Data da última atualização do empréstimo
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Data de exclusão
})
