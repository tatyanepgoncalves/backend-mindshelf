import { and, asc, count, eq, ilike, isNull, type SQL } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'

export class GetBooksService {
  async execute(
    roleUser?: string,
    title?: string,
    author?: string,
    literaryGenreId?: string
  ) {
    const isAdmin = roleUser === 'ADMIN'
    const condiitions: SQL[] = []

    if (!isAdmin) {
      condiitions.push(isNull(schema.books.deletedAt))
    }

    if (title) {
      condiitions.push(ilike(schema.books.title, `%${title}%`))
    }

    if (author) {
      condiitions.push(ilike(schema.books.author, `%${author}%`))
    }

    if (literaryGenreId) {
      condiitions.push(eq(schema.books.literaryGenreId, literaryGenreId))
    }

    const getBooks = await db
      .select({
        author: schema.books.author,
        availableCopies: count(schema.books.id),
        coverUrl: schema.books.coverUrl,
        createdAt: schema.books.createdAt,
        deletedAt: schema.books.deletedAt,
        genre: {
          id: schema.literaryGenres.id,
          name: schema.literaryGenres.name,
        },
        id: schema.books.id,
        isbn: schema.books.isbn,
        locationLibrary: schema.books.locationLibrary,
        publisher: schema.books.publisher,
        synopsis: schema.books.synopsis,
        title: schema.books.title,
        totalCopies: schema.books.totalCopies,
        updatedAt: schema.books.updatedAt,
        year: schema.books.year,
      })
      .from(schema.books)
      .leftJoin(
        schema.literaryGenres,
        eq(schema.books.literaryGenreId, schema.literaryGenres.id)
      )
      .where(condiitions.length > 0 ? and(...condiitions) : undefined)
      .groupBy(
        schema.books.id,
        schema.books.title,
        schema.books.author,
        schema.books.publisher,
        schema.books.year,
        schema.books.totalCopies,
        schema.books.synopsis,
        schema.books.coverUrl,
        schema.books.isbn,
        schema.books.locationLibrary,
        schema.books.createdAt,
        schema.books.updatedAt,
        schema.books.deletedAt,
        schema.literaryGenres.id,
        schema.literaryGenres.name
      )
      .orderBy(asc(schema.books.title))

    const getBooksFormatted = getBooks.map((book) => ({
      ...book,
      availableCopies: Number(book.availableCopies ?? 0),
      createdAt: book.createdAt
        ? formatRelativeTime(book.createdAt)
        : formatRelativeTime(new Date()),
      deletedAt: book.deletedAt ? formatRelativeTime(book.deletedAt) : null,
      genre: {
        id: book.genre?.id ?? '',
        name: book.genre?.name ?? '',
      },
      updatedAt: book.updatedAt ? formatRelativeTime(book.updatedAt) : null,
    }))

    const isEmpty = getBooksFormatted.length === 0

    return {
      books: getBooksFormatted,
      message: isEmpty
        ? 'Nenhum livro encontrado.'
        : 'Livros encontrados com sucesso.',
    }
  }
}
