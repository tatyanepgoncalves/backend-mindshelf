import { and, asc, ilike, isNull, type SQL } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'

export class GetBooksService {
  async execute(
    roleUser?: string,
    title?: string,
    author?: string,
    genreIds?: string[]
  ) {
    const isAdmin = roleUser === 'ADMIN'
    const conditions: SQL[] = []

    if (!isAdmin) {
      conditions.push(isNull(schema.books.deletedAt))
    }

    if (title) {
      conditions.push(ilike(schema.books.title, `%${title}%`))
    }

    if (author) {
      conditions.push(ilike(schema.books.author, `%${author}%`))
    }

    // Busca os livros com seus respectivos relacionamentos
    const booksList = await db.query.books.findMany({
      orderBy: [asc(schema.books.title)],
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        booksToGenres: {
          with: {
            genre: true,
          },
        },
      },
    })

    // Filtra por gênero em memória ou pela query caso `genreIds` esteja preenchido
    const filteredBooks =
      genreIds && genreIds.length > 0
        ? booksList.filter((b) =>
            b.booksToGenres.some((bg) => genreIds.includes(bg.genreId))
          )
        : booksList

    const getBooksFormatted = filteredBooks.map((book) => ({
      author: book.author,
      coverUrl: book.coverUrl ?? null,
      createdAt: book.createdAt
        ? formatRelativeTime(book.createdAt)
        : formatRelativeTime(new Date()),
      deletedAt: book.deletedAt ? formatRelativeTime(book.deletedAt) : null,
      genres: book.booksToGenres
        .map((bg) => bg.genre)
        .filter(Boolean)
        .map((g) => ({
          id: g.id,
          name: g.name,
        })),
      id: book.id,
      isbn: book.isbn ?? null,
      locationLibrary: book.locationLibrary ?? null,
      publisher: book.publisher ?? null,
      synopsis: book.synopsis ?? null,
      title: book.title,
      updatedAt: book.updatedAt ? formatRelativeTime(book.updatedAt) : null,
      year: Number(book.year ?? 0),
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
