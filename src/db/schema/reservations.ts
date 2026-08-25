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
  reservationDate: timestamp('reservation_date', { withTimezone: true }), // Data de reserva sugerido por usuário
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(), // Data de reserva criada
  notifiedAt: timestamp('notified_at', { withTimezone: true }), // Data que leitor foi informado que de acordo com a lista de reserva chegou sua versão
  expiresAt: timestamp('expires_at', { withTimezone: true }), // Data de expiração caso o leitor demorar mais que 7 dias para pegar o livro passe para o próximo da lista
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})
