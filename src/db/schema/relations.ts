import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { loans } from "./loans.js";
import { reservations } from "./reservations.js";
import { books } from "./books.js";
import { literaryGenres } from "./literaryGenres.js";
import { authTokens } from "./authTokens.js";

// USERS RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
  reservations: many(reservations),
  tokens: many(authTokens)
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
  books: many(books),
}))

// BOOKS RELATIONS
export const booksRelations = relations(books, ({ one, many }) => ({
  literaryGenre: one(literaryGenres, {
    fields: [books.literaryGenreId],
    references: [literaryGenres.id],
  }),
  loans: many(loans),
  reservations: many(reservations),
}))

// LOANS RELATIONS 
export const loansRelations = relations(loans, ({ one }) => ({
  reader: one(users, {
    fields: [loans.readerId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [loans.bookId],
    references: [books.id],
  })
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
  })
}))
