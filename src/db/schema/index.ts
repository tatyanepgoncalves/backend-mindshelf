import { authTokens } from './authTokens.js'
import { books } from './books.js'
import { literaryGenres } from './literaryGenres.js'
import { loans } from './loans.js'
import { authTokensRelations, usersRelations, booksRelations, literaryGenreRelations, loansRelations, reservationsRelations,  } from './relations.js'
import { reservations } from './reservations.js'
import { users } from './users.js'

export const schema = {
  users,
  literaryGenres,
  books,
  loans,
  reservations,
  authTokens,

  authTokensRelations,
  usersRelations,
  booksRelations, 
  literaryGenreRelations, 
  loansRelations, 
  reservationsRelations
}
