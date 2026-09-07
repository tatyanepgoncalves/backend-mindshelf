import { and, count, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '../../db/connection.js'
import { schema } from '../../db/schema/index.js'
import { formatRelativeTime } from '../../lib/utils.js'
import type { CreateReservationBodySchema } from '../../schemas/reservations/createReservationSchema.js'
import {
  BookAlreadyReservedError,
  BookNotFoundError,
  MaxReservationsExceededError,
  ReaderNotFoundError,
} from './errors.js'

interface ExecuteInput extends CreateReservationBodySchema {
  authenticatedUserId: string
}

export class CreateReservationService {
  async execute({
    readerId,
    bookIds,
    slugs,
    authenticatedUserId,
    reservationDate,
  }: ExecuteInput) {
    const targetReaderId = readerId ?? authenticatedUserId

    // Verifica existência do leitor
    const reader = await db.query.users.findFirst({
      where: and(
        eq(schema.users.id, targetReaderId),
        isNull(schema.users.deletedAt)
      ),
    })
    if (!reader) {
      throw new ReaderNotFoundError()
    }

    // Regra de Limite (3 itens max: Reservas ativas + Empréstimos ativos)
    const [activeReservationsCount] = await db
      .select({ value: count() })
      .from(schema.reservations)
      .where(
        and(
          eq(schema.reservations.readerId, targetReaderId),
          inArray(schema.reservations.status, ['PENDENTE', 'NOTIFICADO']),
          isNull(schema.reservations.deletedAt)
        )
      )

    const [activeLoansCount] = await db
      .select({ value: count() })
      .from(schema.loans)
      .where(
        and(
          eq(schema.loans.readerId, targetReaderId),
          eq(schema.loans.status, 'ATIVO'),
          isNull(schema.loans.deletedAt)
        )
      )

    const currentTotal = activeReservationsCount.value + activeLoansCount.value

    // Converte `slugs` para array caso venha como string simples
    const slugList = typeof slugs === 'string' ? [slugs] : (slugs ?? [])
    const requestedItemsCount = (bookIds?.length ?? 0) + slugList.length

    if (currentTotal + requestedItemsCount > 3) {
      throw new MaxReservationsExceededError(currentTotal)
    }

    // Busca livros por ID ou por Slug
    const targetBooks = await db.query.books.findMany({
      where: and(
        isNull(schema.books.deletedAt),
        bookIds?.length
          ? inArray(schema.books.id, bookIds)
          : inArray(schema.books.slug, slugList)
      ),
    })

    if (targetBooks.length === 0) {
      throw new BookNotFoundError()
    }

    // Criação das reservas e cálculo da posição na fila
    const createdReservations = await Promise.all(
      targetBooks.map(async (book) => {
        // Verifica se já possui reserva para o mesmo livro
        const existing = await db.query.reservations.findFirst({
          where: and(
            eq(schema.reservations.readerId, targetReaderId),
            eq(schema.reservations.bookId, book.id),
            inArray(schema.reservations.status, ['PENDENTE', 'NOTIFICADO']),
            isNull(schema.reservations.deletedAt)
          ),
        })

        if (existing) {
          throw new BookAlreadyReservedError()
        }

        // Posição na fila
        const [queueCount] = await db
          .select({ value: count() })
          .from(schema.reservations)
          .where(
            and(
              eq(schema.reservations.bookId, book.id),
              eq(schema.reservations.status, 'PENDENTE'),
              isNull(schema.reservations.deletedAt)
            )
          )

        const queuePosition = queueCount.value + 1

        // Prazo de retirada de 48h
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 48)

        const [newReservation] = await db
          .insert(schema.reservations)
          .values({
            bookId: book.id,
            expiresAt,
            readerId: targetReaderId,
            reservationDate: reservationDate
              ? new Date(reservationDate)
              : new Date(),
            status: 'PENDENTE',
          })
          .returning()

        return {
          book: {
            author: book.author,
            coverUrl: book.coverUrl ?? null,
            id: book.id,
            slug: book.slug,
            title: book.title,
          },
          createdAt: newReservation.createdAt
            ? formatRelativeTime(newReservation.createdAt)
            : newReservation.createdAt,
          expiresAt: newReservation.expiresAt
            ? formatRelativeTime(newReservation.expiresAt)
            : newReservation.expiresAt,
          id: newReservation.id,
          queuePosition,
          status: newReservation.status,
        }
      })
    )

    return {
      message: 'Reservas realizadas com sucesso.',
      reservations: createdReservations,
    }
  }
}
