import { and, asc, eq, ilike, isNull, type SQL } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'

export class GetReadersService {
  async execute(roleUser?: string, name?: string) {
    const isAdmin = roleUser === 'ADMIN'
    const conditions: SQL[] = [eq(schema.users.role, 'LEITOR')]

    if (!isAdmin) {
      conditions.push(isNull(schema.users.deletedAt))
    }

    if (name) {
      conditions.push(ilike(schema.users.name, `%${name}%`))
    }

    // Busca os leitores com seus respectivos relacionamentos
    const readersList = await db.query.users.findMany({
      orderBy: [asc(schema.users.name)],
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        loans: {
          where: isNull(schema.loans.returnDate), // Considera apenas empréstimos ativos (não devolvidos)
          with: {
            book: true,
          },
        },
        reservations: {
          where: eq(schema.reservations.status, 'PENDENTE'), // Considera apenas reservas pendentes/ativas
          with: {
            book: true,
          },
        },
      },
    })

    const readersFormatted = readersList.map((reader) => {
      const activeLoansCount = reader.loans.length
      const activeReservationCount = reader.reservations.length

      return {
        email: reader.email,

        id: reader.id,
        image: reader.image ?? null,
        name: reader.name,
        phone: reader.phone ?? null,
        summary: {
          activeLoansCount,
          activeReservationCount,
          hasActiveLoans: activeLoansCount > 0,
          hasActiveReservations: activeReservationCount > 0,
        },
      }
    })

    const isEmpty = readersFormatted.length === 0

    return {
      message: isEmpty
        ? 'Nenhum leitor encontrado.'
        : 'Leitores encontrados com sucesso.',
      readers: readersFormatted,
    }
  }
}
