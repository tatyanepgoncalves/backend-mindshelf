import { ilike, inArray } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime, generateSlug } from '../../lib/utils.js'
import type { CreateBookBodySchema } from '../../schemas/books/createBookSchema.js'

export class BookAlreadyRegisterError extends Error {
  constructor() {
    super('O livro já está cadastrado.')
  }
}

export class CreateBookService {
  async execute(data: CreateBookBodySchema) {
    const { genreIds, ...bookDetails } = data

    return await db.transaction(async (tx) => {
      // Validate that all provided genre IDs actually exist in the database
      const existingGenres = await tx.query.literaryGenres.findMany({
        where: inArray(schema.literaryGenres.id, genreIds),
      })

      if (existingGenres.length !== genreIds.length) {
        throw new Error('One or more specified genre IDs are invalid.')
      }

      const book = await tx.query.books.findFirst({
        where: ilike(schema.books.title, `%${bookDetails.title}%`),
      })

      if (book) {
        throw new BookAlreadyRegisterError()
      }

      const slug = generateSlug(bookDetails.title)

      //  Insert the book record into the 'books' table
      const [newBook] = await tx
        .insert(schema.books)
        .values({
          author: bookDetails.author,
          coverUrl: bookDetails.coverUrl ?? null,
          isbn: bookDetails.isbn ?? null,
          locationLibrary: bookDetails.locationLibrary ?? null,
          publisher: bookDetails.publisher ?? null,
          slug,
          synopsis: bookDetails.synopsis ?? null,
          title: bookDetails.title,
          year: Number(bookDetails.year),
        })
        .returning()

      // Map each genre ID to the newly created book ID
      const pivotRecords = genreIds.map((genreId) => ({
        bookId: newBook.id,
        genreId,
      }))

      // Bulk-insert the relation links into the junction table
      await tx.insert(schema.booksToGenres).values(pivotRecords)

      // Format and return the response payload
      return {
        book: {
          author: newBook.author,
          coverUrl: newBook.coverUrl,
          createdAt: formatRelativeTime(newBook.createdAt),
          genres: existingGenres.map((g) => ({
            id: g.id,
            name: g.name,
          })),
          id: newBook.id,
          isbn: newBook.isbn,
          locationLibrary: newBook.locationLibrary,
          publisher: newBook.publisher,
          slug: newBook.slug,
          synopsis: newBook.synopsis,
          title: newBook.title,
          year: newBook.year,
        },
        message: `Livro ${newBook.title} cadastrado com sucesso!`,
      }
    })
  }
}
