import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { UpdateStatusLoanByIdBodySchema } from '../../schemas/loans/updateStatusLoanByIdSchema.js'
import { LoanItemNotFoundError } from './deleteLoanItemService.js'
import { LoanItemAlreadyReturnedError } from './errors.js'

export class UpdateStatusLoanByIdService {
  async execute(itemId: string, data: UpdateStatusLoanByIdBodySchema) {
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

    if (loanItem.status === 'DEVOLVIDO' && data.status === 'DEVOLVIDO') {
      throw new LoanItemAlreadyReturnedError()
    }

    // Montagem dinâmica das colunas da tabela 'books'
    // biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic assignment
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (data.status) {
      updateData.status = data.status

      if (data.status === 'DEVOLVIDO') {
        updateData.returnDate = data.returnDate
          ? new Date(data.returnDate)
          : new Date()
      } else {
        updateData.returnDate = null
      }
    } else if (data.returnDate) {
      // Caso atualize apenas a data de devolução sem alterar o status diretamente
      updateData.returnDate = new Date(data.returnDate)
    }

    // Devolve o livro
    const [updatedLoan] = await db
      .update(schema.loansItems)
      .set(updateData)
      .where(eq(schema.loansItems.id, loanItem.id))
      .returning()

    return {
      loan: {
        id: updatedLoan.id,
        returnDate: updatedLoan.returnDate
          ? formatRelativeTime(updatedLoan.returnDate)
          : null,
        status: updatedLoan.status,
        updatedAt: updatedLoan.updatedAt
          ? formatRelativeTime(updatedLoan.updatedAt)
          : updatedLoan.updatedAt,
      },
      message: `Livro ${loanItem.book.title} devolvido com sucesso.`,
    }
  }
}
