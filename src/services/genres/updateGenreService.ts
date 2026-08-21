import { and, eq, isNull, ne } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { UpdateGenreBody } from '../../schemas/genres/updateGenreSchema.js'

export class GenreNotFoundError extends Error {
  constructor() {
    super('Gênero literário não encontrado.')
  }
}

export class GenreAlreadyExistsError extends Error {
  constructor() {
    super('Gênero literário com este nome já existe.')
  }
}

export class UnauthorizedRestoreError extends Error {
  constructor() {
    super('Apenas administradores podem restaurar um gênero arquivado.')
  }
}

export class UpdateGenreService {
  async execute(id: string, data: UpdateGenreBody, userRole: string) {
    const isAdmin = userRole === 'ADMIN'

    // Se tentar restaurar sem ser ADMIN, lança erro de autorização
    if (data.restore && !isAdmin) {
      throw new UnauthorizedRestoreError()
    }

    // Busca o gênero. Admins enxergam mesmo se estiver arquivado
    const genre = await db.query.literaryGenres.findFirst({
      where: isAdmin
        ? eq(schema.literaryGenres.id, id)
        : and(
            eq(schema.literaryGenres.id, id),
            isNull(schema.literaryGenres.deletedAt)
          ),
    })

    if (!genre) {
      throw new GenreNotFoundError()
    }

    // Verifica se o novo nome já está em uso por outro gênero
    if (data.name && data.name !== genre.name) {
      const nameExists = await db.query.literaryGenres.findFirst({
        where: and(
          eq(schema.literaryGenres.name, data.name),
          ne(schema.literaryGenres.id, id)
        ),
      })

      if (nameExists) {
        throw new GenreAlreadyExistsError()
      }
    }

    // Prepara o payload dinâmico
    // biome-ignore lint/suspicious/noExplicitAny: necessário para tipar o update do Drizzle
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (data.name) {
      updateData.name = data.name
    }

    // Se restore for true, remove a data de exclusão lógica
    if (data.restore) {
      updateData.deletedAt = null
    }

    const [updateGenre] = await db
      .update(schema.literaryGenres)
      .set(updateData)
      .where(eq(schema.literaryGenres.id, id))
      .returning()

    const isRestoring = Boolean(data.restore && genre.deletedAt)

    return {
      genreUpdated: {
        createdAt: updateGenre.createdAt
          ? formatRelativeTime(updateGenre.createdAt)
          : formatRelativeTime(new Date()),
        deletedAt: updateGenre.deletedAt
          ? formatRelativeTime(updateGenre.deletedAt)
          : null,
        id: updateGenre.id,
        name: updateGenre.name,
        updatedAt: updateGenre.updatedAt
          ? formatRelativeTime(updateGenre.updatedAt)
          : null,
      },
      message: isRestoring
        ? `${updateGenre.name} foi restaurado com sucesso.`
        : `${genre.name} atualizado com sucesso.`,
    }
  }
}
