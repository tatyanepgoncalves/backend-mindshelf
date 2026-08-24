import { authTokens } from './authTokens.js'
import { books } from './books.js'
import { booksToGenres } from './booksToGenres.js'
import { literaryGenres } from './literaryGenres.js'
import { loansItems } from './loanItems.js'
import { loans } from './loans.js'
import {
  authTokensRelations,
  booksRelations,
  booksToGenresRelations,
  literaryGenreRelations,
  loansItemsRelations,
  loansRelations,
  reservationsRelations,
  usersRelations,
} from './relations.js'
import { reservations } from './reservations.js'
import { users } from './users.js'

export const schema = {
  users,
  literaryGenres,
  books,
  loans,
  loansItems,
  reservations,
  authTokens,
  booksToGenres,

  authTokensRelations,
  usersRelations,
  booksRelations,
  literaryGenreRelations,
  loansRelations,
  reservationsRelations,
  booksToGenresRelations,
  loansItemsRelations,
}
