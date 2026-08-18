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
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  returnDate: timestamp('return_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})
