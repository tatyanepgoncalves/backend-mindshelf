import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { literaryGenres } from './literaryGenres.js'

export const books = pgTable('books', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  publisher: text('publisher'),
  year: integer('year'),
  literaryGenreId: uuid('literary_genre_id')
    .references(() => literaryGenres.id, { onDelete: 'restrict' })
    .notNull(),
  totalCopies: integer('total_copies').notNull(),
  synopsis: text('synopsis'),
  coverUrl: text('cover_url'),
  isbn: text('isbn').unique(),
  locationLibrary: text('location_library'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})
