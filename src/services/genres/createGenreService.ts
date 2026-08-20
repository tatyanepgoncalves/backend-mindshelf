import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { CreateGenreSchema } from '../../schemas/genres/createGenreSchema.js'

export class GenreAlreadyExistError extends Error {
  constructor() {
    super('Gênero já existe.')
  }
}

export class CreateGenreService {
  async execute({ name }: CreateGenreSchema) {
    return await db.transaction(async (tx) => {
      // Check if genre already exists
      const genreExists = await tx.query.literaryGenres.findFirst({
        where: eq(schema.literaryGenres.name, name),
      })

      if (genreExists) {
        throw new GenreAlreadyExistError()
      }

      const [genre] = await tx
        .insert(schema.literaryGenres)
        .values({
          name,
        })
        .returning()

      return {
        genre: {
          createdAt: genre.createdAt
            ? formatRelativeTime(genre.createdAt)
            : formatRelativeTime(new Date()),
          id: genre.id,
          name: genre.name,
        },
        message: `Gênero ${genre.name} criado com sucesso.`,
      }
    })
  }
}
