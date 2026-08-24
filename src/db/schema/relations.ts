import { relations } from 'drizzle-orm'
import { authTokens } from './authTokens.js'
import { books } from './books.js'
import { booksToGenres } from './booksToGenres.js'
import { literaryGenres } from './literaryGenres.js'
import { loansItems } from './loanItems.js'
import { loans } from './loans.js'
import { reservations } from './reservations.js'
import { users } from './users.js'

// USERS RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
  reservations: many(reservations),
  tokens: many(authTokens),
}))

// AUTH TOKENS RELATIONS
export const authTokensRelations = relations(authTokens, ({ one }) => ({
  usuario: one(users, {
    fields: [authTokens.userId],
    references: [users.id],
  }),
}))

// LITERARY GENRE RELATIONS
export const literaryGenreRelations = relations(literaryGenres, ({ many }) => ({
  genresToBooks: many(booksToGenres),
}))

// BOOKS RELATIONS
export const booksRelations = relations(books, ({ many }) => ({
  booksToGenres: many(booksToGenres),
  loansItems: many(loansItems),
  reservations: many(reservations),
}))

// BOOKS TO GENRES RELATIONS (Pivot Table)
export const booksToGenresRelations = relations(booksToGenres, ({ one }) => ({
  book: one(books, {
    fields: [booksToGenres.bookId],
    references: [books.id],
  }),
  genre: one(literaryGenres, {
    fields: [booksToGenres.genreId],
    references: [literaryGenres.id],
  }),
}))

// LOANS RELATIONS
export const loansRelations = relations(loans, ({ one, many }) => ({
  reader: one(users, {
    fields: [loans.readerId],
    references: [users.id],
  }),
  items: many(loansItems),
}))

// LOANS ITEMS RELATIONS
export const loansItemsRelations = relations(loansItems, ({ one }) => ({
  loan: one(loans, {
    fields: [loansItems.loanId],
    references: [loans.id],
  }),
  book: one(books, {
    fields: [loansItems.bookId],
    references: [books.id],
  }),
}))

// RESERVATIONS RELATIONS
export const reservationsRelations = relations(reservations, ({ one }) => ({
  reader: one(users, {
    fields: [reservations.readerId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [reservations.bookId],
    references: [books.id],
  }),
}))
