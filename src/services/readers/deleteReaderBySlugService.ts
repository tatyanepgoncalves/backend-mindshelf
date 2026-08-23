import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import { ReaderNotFoundError } from './updateReaderBySlugService.js'

export class DeleteReaderBySlugService {
  async execute(slug: string) {
    const reader = await db.query.users.findFirst({
      where: and(
        eq(schema.users.slug, slug),
        eq(schema.users.role, 'LEITOR'),
        isNull(schema.users.deletedAt)
      ),
    })

    if (!reader) {
      throw new ReaderNotFoundError()
    }

    await db.delete(schema.users).where(eq(schema.users.id, reader.id))

    await db
      .delete(schema.authTokens)
      .where(eq(schema.authTokens.userId, reader.id))

    return {
      message: `${reader.name} deletado com sucesso!`,
      reader: {
        deletedAt: formatRelativeTime(new Date()),
        id: reader.id,
        name: reader.name,
      },
    }
  }
}
