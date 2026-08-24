import { and, desc, eq, isNull, type SQL, sql } from 'drizzle-orm'
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
    const { readerSlug, bookSlug, status, mes } = query

    const conditions: SQL[] = []

    if (!isAdmin) {
      // Se não for administrador, não mostra os emprestimos deletados
      conditions.push(isNull(schema.loans.deletedAt))
    }

    // Se o filtro readerSlug for passado, busca o id do leitor correspondente
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
        conditions.push(eq(schema.loans.bookId, book.id))
      } else {
        // Se o livro informado não existir, retorna lista vazia imediatamente
        return { loans: [], message: 'Nenhum empréstimo encontrado.' }
      }
    }

    if (status) {
      conditions.push(eq(schema.loans.status, status))
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

    // Busca os empréstimos com os relacionamentos de leitor e livro
    const loans = await db.query.loans.findMany({
      orderBy: desc(schema.loans.createdAt),
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        book: true,
        reader: true,
      },
    })

    if (!loans) {
      throw new LoansNotFoundError()
    }

    const isEmpty = loans.length === 0

    return {
      loans: loans.map((loan) => ({
        book: {
          author: loan.book.author,
          id: loan.book.id,
          slug: loan.book.slug,
          title: loan.book.title,
        },
        createdAt: loan.createdAt
          ? formatRelativeTime(loan.createdAt)
          : loan.createdAt,
        deletedAt: loan.deletedAt ? formatRelativeTime(loan.deletedAt) : null,
        dueDate: loan.dueDate ? formatRelativeTime(loan.dueDate) : loan.dueDate,
        id: loan.id,
        reader: {
          id: loan.reader.id,
          name: loan.reader.name,
          slug: loan.reader.slug,
        },
        returnDate: loan.returnDate
          ? formatRelativeTime(loan.returnDate)
          : null,
        status: loan.status,
        updatedAt: loan.updatedAt ? formatRelativeTime(loan.updatedAt) : null,
      })),
      message: isEmpty
        ? 'Nenhum empréstimo encontrado.'
        : 'Empréstimos recuperados com sucesso.',
    }
  }
}
