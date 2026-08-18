import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { books } from './books.js'
import { reservationStatusEnum } from './enums.js'
import { users } from './users.js'

export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookId: uuid('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  readerId: uuid('reader_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  status: reservationStatusEnum('status').default('PENDENTE').notNull(),
  reservationDate: timestamp('reservation_date', { withTimezone: true })
    .defaultNow()
    .notNull(),
  reservedAt: timestamp('reserved_at', { withTimezone: true }),
  notifiedAt: timestamp('notified_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})
