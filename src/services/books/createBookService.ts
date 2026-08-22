import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { CreateBookBodySchema } from '../../schemas/books/createBookSchema.js'

// Erro personalizado para capturar o conflito de email e telefone (HTTP 409)
export class BookAlreadyRegisterError extends Error {
  constructor() {
    super('O livro já está cadastrado.')
  }
}

export class CreateBookService {
  async execute({
    title,
    author,
    publisher,
    year,
    literaryGenreId,
    synopsis,
    coverUrl,
    isbn,
    locationLibrary,
  }: CreateBookBodySchema) {
    return await db.transaction(async (tx) => {
      const bookExists = await tx.query.books.findFirst({
        where: eq(schema.books.title, title),
      })

      if (bookExists) {
        throw new BookAlreadyRegisterError()
      }

      const [book] = await tx
        .insert(schema.books)
        .values({
          author,
          coverUrl,
          isbn,
          literaryGenreId,
          locationLibrary,
          publisher,
          synopsis,
          title,
          year: Number(year),
        })
        .returning()

      return {
        book: {
          author: book.author,
          coverUrl: book.coverUrl ?? null,
          createdAt: book.createdAt
            ? formatRelativeTime(book.createdAt)
            : book.createdAt,
          id: book.id,
          isbn: book.isbn ?? null,
          literaryGenreId: book.literaryGenreId,
          locationLibrary: book.locationLibrary ?? null,
          publisher: book.publisher ?? null,
          synopsis: book.synopsis ?? null,
          title: book.title,
          year: book.year,
        },
        message: `Livro ${book.title} cadastrado com sucesso.`,
      }
    })
  }
}
