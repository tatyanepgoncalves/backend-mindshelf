import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'

export class LoanItemNotFoundError extends Error {
  constructor() {
    super('Item de empréstimo não encontrado.')
  }
}

export class DeleteLoanItemService {
  async execute(itemId: string, hardDelete = false) {
    const loanItem = await db.query.loansItems.findFirst({
      where: and(
        eq(schema.loansItems.id, itemId),
        isNull(schema.loansItems.deletedAt)
      ),
      with: {
        book: {
          columns: {
            title: true,
          },
        },
      },
    })

    if (!loanItem) {
      throw new LoanItemNotFoundError()
    }

    // Exclusão Física (Apaga a linha no PostgreSQL)
    if (hardDelete) {
      await db.delete(schema.loansItems).where(eq(schema.loansItems.id, itemId))

      return {
        message: `Empréstimo do livro "${loanItem.book.title}" apagado permanentemente com sucesso.`,
      }
    }

    // Exclusão Lógica (Soft Delete + Status CANCELADO)
    await db
      .update(schema.loansItems)
      .set({
        deletedAt: new Date(),
        status: 'CANCELADO',
        updatedAt: new Date(),
      })
      .where(eq(schema.loansItems.id, itemId))

    return {
      message: `Empréstimo do livro "${loanItem.book.title}" cancelado com sucesso.`,
    }
  }
}
