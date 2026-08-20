import { eq } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { UpdateUserBodySchema } from '../../schemas/users/updateUserSchema.js'

export class GenreNotFoundError extends Error {
  constructor() {
    super('Gênero literário não encontrado.')
  }
}

export class GenreAlreadyExistsError extends Error {
  constructor() {
    super('Gênero literário já existe.')
  }
}

export class UpdateGenreService {
  async execute(id: string, data: UpdateUserBodySchema) {
    // Check if genre already exists
    const genre = await db.query.literaryGenres.findFirst({
      where: eq(schema.literaryGenres.id, id),
    })

    if (!genre) {
      throw new GenreNotFoundError()
    }

    // Prepares data for dynamic updating
    // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (data.name) {
      updateData.name = data.name
    }

    // Updates the user and returns the modified record.
    const [updateGenre] = await db
      .update(schema.literaryGenres)
      .set(updateData)
      .where(eq(schema.literaryGenres.id, id))
      .returning()

    return {
      genreUpdated: {
        createdAt: updateGenre.createdAt
          ? formatRelativeTime(updateGenre.createdAt)
          : updateGenre.createdAt,
        deletedAt: updateGenre.deletedAt
          ? formatRelativeTime(updateGenre.deletedAt)
          : null,
        id: updateGenre.id,
        name: updateGenre.name,
        updatedAt: updateGenre.updatedAt
          ? formatRelativeTime(updateGenre.updatedAt)
          : null,
      },
      message: `${genre.name} atualizado para ${updateGenre.name} com sucesso.`,
    }
  }
}
