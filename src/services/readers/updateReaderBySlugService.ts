import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { redis } from '../../config/ioredis.js'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import {
  formatPhone,
  formatRelativeTime,
  generateSlug,
} from '../../lib/utils.js'
import type { UpdateReaderBodySchema } from '../../schemas/readers/updateReaderSchema.js'

export class ReaderAlreadyExistsError extends Error {
  constructor() {
    super('Leitor com email ou telefone já cadastrado.')
  }
}

export class ReaderNotFoundError extends Error {
  constructor() {
    super('Leitor não encontrado.')
  }
}

export class UpdateReaderBySlugService {
  async execute(slug: string, data: UpdateReaderBodySchema) {
    const reader = await db.query.users.findFirst({
      where: eq(schema.users.slug, slug),
    })

    if (!reader) {
      throw new ReaderNotFoundError()
    }

    // Prepara os dados para atualização dinamicamente
    // biome-ignore lint/suspicious/noExplicitAny: it's necessary
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (data.name) {
      updateData.name = data.name
      updateData.slug = generateSlug(data.name)
    }
    if (data.email) {
      updateData.email = data.email
    }
    if (data.phone) {
      updateData.phone = data.phone
    }
    if (data.image) {
      updateData.image = data.image
    }
    if (data.address) {
      updateData.address = data.address
    }

    // Realiza o hash se uma nova senha for informada
    if (data.password) {
      updateData.password = await hash(data.password, 10)
    }

    // Limpa ou atualiza o cache da sessão no Redis
    const cacheKey = `user-session:${reader.id}`
    await redis.del(cacheKey)

    // Atualiza o leitor e retorna o registro modificado
    const [updatedReader] = await db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, reader.id))
      .returning()

    return {
      message: `${reader.name ?? 'Leitor'} atualizado para ${updatedReader.name ?? 'Leitor'} com sucesso!`,
      reader: {
        address: updatedReader.address,
        email: updatedReader.email,
        id: updatedReader.id,
        image: updatedReader.image,
        name: updatedReader.name,
        phone: updatedReader.phone
          ? formatPhone(updatedReader.phone)
          : updatedReader.phone,
        slug: updatedReader.slug,
        updatedAt: updatedReader.updatedAt
          ? formatRelativeTime(updatedReader.updatedAt)
          : updatedReader.updatedAt,
      },
    }
  }
}
