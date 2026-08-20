import { and, asc, count, eq, isNull, type SQL } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'

export class GetGenresService {
  async execute(roleUser: string, name?: string) {
    const isAdmin = roleUser === 'ADMIN'
    const conditions: SQL[] = []

    // Filter 1: If the user isn't ADMIN, hide the deleted books
    if (!isAdmin) {
      conditions.push(isNull(schema.literaryGenres.deletedAt))
    }

    // Filter 2 (optional): get books by name  (case-insensitive)
    if (name) {
      conditions.push(eq(schema.literaryGenres.name, name))
    }

    // Search for genres with grouping and book counts.
    const genresWithBooksCount = await db
      .select({
        createdAt: schema.literaryGenres.createdAt,
        deletedAt: schema.literaryGenres.deletedAt,
        id: schema.literaryGenres.id,
        name: schema.literaryGenres.name,
        quantityBooks: count(schema.books.id),
        updatedAt: schema.literaryGenres.updatedAt,
      })
      .from(schema.literaryGenres)
      .leftJoin(
        schema.books,
        eq(schema.literaryGenres.id, schema.books.literaryGenreId)
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(schema.literaryGenres.id)
      .orderBy(asc(schema.literaryGenres.name))

    const genresFormatted = genresWithBooksCount.map((genre) => ({
      createdAt: genre.createdAt ? formatRelativeTime(genre.createdAt) : null,
      deletedAt: genre.deletedAt ? formatRelativeTime(genre.deletedAt) : null,
      id: genre.id,
      name: genre.name,
      quantityBooks: Number(genre.quantityBooks),
      updatedAt: genre.updatedAt ? formatRelativeTime(genre.updatedAt) : null,
    }))

    return {
      genres: genresFormatted,
      message: 'Gêneros literários listados com sucesso!',
    }
  }
}
