import { desc, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'

export class GetLastBooksService {
  async execute(limit = 5) {
    const booksList = await db.query.books.findMany({
      limit,
      orderBy: desc(schema.books.createdAt),
      where: isNull(schema.books.deletedAt),
      with: {
        booksToGenres: {
          with: {
            genre: true,
          },
        },
      },
    })

    const getBooksFormatted = booksList.map((book) => ({
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
      slug: book.slug,
      synopsis: book.synopsis ?? null,
      title: book.title,
      updatedAt: book.updatedAt ? formatRelativeTime(book.updatedAt) : null,
      year: Number(book.year ?? 0),
    }))

    const isEmpty = getBooksFormatted.length === 0

    return {
      books: getBooksFormatted,
      message: isEmpty
        ? 'Nenhum livro recente encontrado.'
        : 'Últimos livros recuperados com sucesso.',
    }
  }
}
