import { and, eq, isNull, type SQL, sql } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { GetLoansQuerySchema } from '../../schemas/loans/getLoansSchema.js'

export class LoansNotFoundError extends Error {
  constructor() {
    super('Nenhum empréstimo encontrado com os critérios especificados.')
  }
}

export class GetLoansService {
  async execute(query: GetLoansQuerySchema, isAdmin = false) {
    const { bookSlug, mes, readerSlug, status } = query
    const conditions: SQL[] = []

    if (!isAdmin) {
      // Se não for administrador, não mostra os emprestimos deletados
      conditions.push(isNull(schema.loans.deletedAt))
    }

    // Se o filtro readerSlug for passado, busca o id do livro correspondente
    if (readerSlug) {
      const reader = await db.query.users.findFirst({
        columns: {
          id: true,
        },
        where: eq(schema.users.slug, readerSlug),
      })

      if (reader) {
        conditions.push(eq(schema.loans.readerId, reader.id))
      } else {
        // Se o leitor informado não existir, retorna lista vazia imediatamente
        return {
          loans: [],
          message: 'Nenhum empréstimo encontrado.',
        }
      }
    }
    // Se o filtro bookSlug for passado, busca o id do livro correspondente
    if (bookSlug) {
      const book = await db.query.books.findFirst({
        columns: { id: true },
        where: eq(schema.books.slug, bookSlug),
      })

      if (book) {
        conditions.push(eq(schema.loansItems.bookId, book.id))
      } else {
        // Se o livro informado não existir, retorna lista vazia imediatamente
        return { loans: [], message: 'Nenhum empréstimo encontrado.' }
      }
    }
    if (status) {
      conditions.push(eq(schema.loansItems.status, status))
    }

    if (mes) {
      const monthNumber = Number(mes)
      if (!Number.isNaN(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
        // Filtra pelo mês de criação (EXTRACT MONTH no PostgreSQL)
        conditions.push(
          sql`EXTRACT(MONTH FROM ${schema.loans.createdAt}) = ${monthNumber}`
        )
      }
    }

    const loansList = await db.query.loans.findMany({
      orderBy: (loans, { desc }) => [desc(loans.createdAt)],
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        items: {
          with: {
            book: true,
          },
        },
        reader: true,
      },
    })

    const formattedLoans = loansList.map((loan) => ({
      createdAt: loan.createdAt
        ? formatRelativeTime(loan.createdAt)
        : loan.createdAt,
      id: loan.id, // 1 UUID único por agrupamento de empréstimo
      items: loan.items.map((item) => ({
        book: {
          author: item.book.author,
          id: item.book.id,
          slug: item.book.slug,
          title: item.book.title,
        },
        dueDate: item.dueDate ? formatRelativeTime(item.dueDate) : item.dueDate,
        id: item.id,
        returnDate: item.returnDate
          ? formatRelativeTime(item.returnDate)
          : null,
        status: item.status,
      })),
      reader: {
        id: loan.reader.id,
        name: loan.reader.name,
        slug: loan.reader.slug,
      },
    }))

    return {
      loans: formattedLoans,
      message: 'Empréstimos recuperados com sucesso.',
    }
  }
}
