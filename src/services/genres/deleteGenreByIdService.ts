import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'

export class GenreNotFoundOrHadArquivedError extends Error {
  constructor() {
    super('Gênero literário não encontrado ou já foi arquivado anteriormente.')
  }
}

export class UnauthorizedHardDeleteError extends Error {
  constructor() {
    super('Apenas administradores podem excluir um gênero permanentemente.')
  }
}

export class DeleteGenreByIdService {
  async execute(genreId: string, permanente: boolean, userRole: string) {
    if (permanente && userRole !== 'ADMIN') {
      throw new UnauthorizedHardDeleteError()
    }

    const genre = await db.query.literaryGenres.findFirst({
      where: permanente
        ? eq(schema.literaryGenres.id, genreId)
        : and(
            eq(schema.literaryGenres.id, genreId),
            isNull(schema.literaryGenres.deletedAt)
          ),
    })

    if (!genre) {
      throw new GenreNotFoundOrHadArquivedError()
    }

    if (permanente) {
      // Hard Delete
      await db.transaction(async (tx) => {
        // deletes the books linked to the literary genre
        await tx
          .delete(schema.booksToGenres)
          .where(eq(schema.booksToGenres.genreId, genreId))

        // deletes the literary genre
        await tx
          .delete(schema.literaryGenres)
          .where(eq(schema.literaryGenres.id, genreId))
      })
    } else {
      // Soft Delete
      await db
        .update(schema.literaryGenres)
        .set({ deletedAt: new Date() })
        .where(eq(schema.literaryGenres.id, genreId))
    }

    return {
      message: permanente
        ? `${genre.name} foi excluído permanentemente.`
        : `${genre.name} foi arquivado.`,
    }
  }
}
