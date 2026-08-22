import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'

export class SlugBookNotFoundError extends Error {
  constructor() {
    super('Livro não encontrado com base no slug fornecido.')
  }
}

export class GetBookBySlugService {
  async execute(slug: string) {
    // Search book by id
    const book = await db.query.books.findFirst({
      where: eq(schema.books.slug, slug),
      with: {
        booksToGenres: {
          with: {
            genre: true,
          },
        },
      },
    })

    if (!book) {
      throw new SlugBookNotFoundError()
    }

    return {
      book: {
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
      },
      message: 'Livro encontrado com sucesso.',
    }
  }
}
