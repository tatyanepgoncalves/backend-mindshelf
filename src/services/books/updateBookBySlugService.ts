import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime, generateSlug } from '../../lib/utils.js'
import type { UpdateBookBySlugBodySchema } from '../../schemas/books/updateBookBySlugSchema.js'
import { SlugBookNotFoundError } from './getBookBySlugService.js'

export class UnauthorizedUpdateError extends Error {
  constructor() {
    super('Apenas administradores ou voluntários podem atualizar um livro.')
  }
}

export class ConflictBookError extends Error {
  constructor() {
    super('Livro já existe com as mesmas informações.')
  }
}

export class UpdateBookBySlugService {
  async execute(
    slug: string,
    userRole: string,
    data: UpdateBookBySlugBodySchema
  ) {
    const canUpdate = userRole === 'ADMIN' || userRole === 'VOLUNTARIO'

    if (!canUpdate) {
      throw new UnauthorizedUpdateError()
    }

    return await db.transaction(async (tx) => {
      const book = await tx.query.books.findFirst({
        where: eq(schema.books.slug, slug),
      })

      if (!book) {
        throw new SlugBookNotFoundError()
      }

      // Montagem dinâmica das colunas da tabela 'books'
      // biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic assignment
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      }

      if (data.title) {
        updateData.title = data.title
        updateData.slug = generateSlug(data.title) // Recalcula o slug se o título mudar
      }
      if (data.author) {
        updateData.author = data.author
      }
      if (data.publisher !== undefined) {
        updateData.publisher = data.publisher
      }
      if (data.year) {
        updateData.year = Number(data.year)
      }
      if (data.synopsis !== undefined) {
        updateData.synopsis = data.synopsis
      }
      if (data.coverUrl !== undefined) {
        updateData.coverUrl = data.coverUrl
      }
      if (data.isbn !== undefined) {
        updateData.isbn = data.isbn
      }
      if (data.locationLibrary !== undefined) {
        updateData.locationLibrary = data.locationLibrary
      }

      if (data.restore && book.deletedAt) {
        updateData.deletedAt = null
      }

      // Atualiza os dados básicos do livro
      const [updatedBook] = await tx
        .update(schema.books)
        .set(updateData)
        .where(eq(schema.books.id, book.id))
        .returning()

      // Atualização condicional da tabela pivô 'books_to_genres'
      if (data.genreIds && data.genreIds.length > 0) {
        // Remove relações antigas
        await tx
          .delete(schema.booksToGenres)
          .where(eq(schema.booksToGenres.bookId, book.id))

        // Insere as novas associações
        const newPivotRecords = data.genreIds.map((genreId) => ({
          bookId: book.id,
          genreId,
        }))

        await tx.insert(schema.booksToGenres).values(newPivotRecords)
      }

      // Busca gêneros atualizados para retorno da API
      const updatedGenres = await tx.query.booksToGenres.findMany({
        where: eq(schema.booksToGenres.bookId, book.id),
        with: {
          genre: true,
        },
      })

      const bookFormatted = {
        author: updatedBook.author,
        coverUrl: updatedBook.coverUrl,
        createdAt: updatedBook.createdAt
          ? formatRelativeTime(updatedBook.createdAt)
          : formatRelativeTime(new Date()),
        deletedAt: updatedBook.deletedAt
          ? formatRelativeTime(updatedBook.deletedAt)
          : null,
        genres: updatedGenres
          .map((g) => g.genre)
          .filter(Boolean)
          .map((g) => ({ id: g.id, name: g.name })),
        id: updatedBook.id,
        isbn: updatedBook.isbn,
        locationLibrary: updatedBook.locationLibrary,
        publisher: updatedBook.publisher,
        slug: updatedBook.slug,
        synopsis: updatedBook.synopsis,
        title: updatedBook.title,
        updatedAt: updatedBook.updatedAt
          ? formatRelativeTime(updatedBook.updatedAt)
          : null,
        year: updatedBook.year,
      }

      const isRestoring = Boolean(data.restore && book.deletedAt)

      return {
        book: bookFormatted,
        message: isRestoring
          ? 'Livro restaurado com sucesso!'
          : 'Livro atualizado com sucesso!',
      }
    })
  }
}
