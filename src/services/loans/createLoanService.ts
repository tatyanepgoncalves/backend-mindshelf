import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { CreateLoanBodySchema } from '../../schemas/loans/createLoanSchema.js'
import { ReaderNotFound } from '../readers/errors.js'
import { BookHasLoan, LimitExcededLoan } from './errors.js'

export class CreateLoanService {
  async execute(data: CreateLoanBodySchema) {
    const { readerId, books: requestedBooks } = data
    const bookIdsInRequest = requestedBooks.map((item) => item.bookId)

    return await db.transaction(async (tx) => {
      // Verifica Leitor
      const existingReader = await tx.query.users.findFirst({
        where: and(
          eq(schema.users.id, readerId),
          isNull(schema.users.deletedAt)
        ),
      })
      if (!existingReader) {
        throw new ReaderNotFound()
      }

      // Conta empréstimos ativos em `loanItems`
      const activeItems = await tx.query.loansItems.findMany({
        where: and(
          eq(schema.loansItems.status, 'ATIVO'),
          isNull(schema.loansItems.deletedAt)
        ),
        with: { loan: true },
      })

      const readerActiveCount = activeItems.filter(
        (item) => item.loan.readerId === readerId
      ).length

      if (readerActiveCount + requestedBooks.length > 3) {
        throw new LimitExcededLoan(readerActiveCount)
      }

      // Verifica conflito de livros já emprestados
      const activeBookLoans = await tx.query.loansItems.findMany({
        where: and(
          inArray(schema.loansItems.bookId, bookIdsInRequest),
          eq(schema.loansItems.status, 'ATIVO'),
          isNull(schema.loansItems.deletedAt)
        ),
      })
      if (activeBookLoans.length > 0) {
        throw new BookHasLoan()
      }

      // Busca livros do banco
      const booksFromDb = await tx.query.books.findMany({
        where: and(
          inArray(schema.books.id, bookIdsInRequest),
          isNull(schema.books.deletedAt)
        ),
      })

      //  Cria 1 ÚNICO Registro de Loan (Cabeçalho)
      const [newLoan] = await tx
        .insert(schema.loans)
        .values({ readerId })
        .returning()

      // Prepara e insere os itens em `loanItems`
      const itemsToInsert = requestedBooks.map((item) => {
        const startDate = item.issuedAt ? new Date(item.issuedAt) : new Date()
        const dueDate = new Date(startDate)
        dueDate.setDate(dueDate.getDate() + item.dueDays)

        return {
          bookId: item.bookId,
          createdAt: startDate,
          dueDate,
          loanId: newLoan.id,
          status: 'ATIVO' as const,
        }
      })

      const insertedItems = await tx
        .insert(schema.loansItems)
        .values(itemsToInsert)
        .returning()

      // Formata a resposta agrupada
      return {
        loan: {
          createdAt: newLoan.createdAt.toISOString(),
          id: newLoan.id,
          items: insertedItems.map((item) => {
            // biome-ignore lint/style/noNonNullAssertion: it's necessarsy
            const book = booksFromDb.find((b) => b.id === item.bookId)!
            return {
              book: {
                author: book.author,
                id: book.id,
                title: book.title,
              },
              dueDate: item.dueDate
                ? formatRelativeTime(item.dueDate)
                : item.dueDate,
              id: item.id,
              returnDate: item.returnDate
                ? formatRelativeTime(item.returnDate)
                : null,
              status: item.status,
            }
          }),
          reader: {
            id: existingReader.id,
            name: existingReader.name,
          },
        },
        message: 'Empréstimo realizado com sucesso!',
      }
    })
  }
}
