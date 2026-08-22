import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { books } from './books.js'
import { literaryGenres } from './literaryGenres.js'

export const booksToGenres = pgTable(
  'books_to_genres',
  {
    bookId: uuid('book_id')
      .notNull()
      .references(() => books.id, {
        onDelete: 'cascade',
      }),
    genreId: uuid('genre_id')
      .notNull()
      .references(() => literaryGenres.id, {
        onDelete: 'cascade',
      }),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.genreId] })]
)
