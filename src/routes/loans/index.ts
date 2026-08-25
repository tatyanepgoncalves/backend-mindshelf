import type { FastifyInstance } from 'fastify'
import { createLoanRoute } from './createLoanRoute.js'
import { getLoanByIdRoute } from './getLoanByIdRoute.js'
import { getLoansRoute } from './getLoansRoute.js'
import { updateStatusLoanByIdRoute } from './updateStatusLoanByIdRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function loansRoutes(app: FastifyInstance) {
  app.register(getLoansRoute)
  app.register(getLoanByIdRoute)
  app.register(createLoanRoute)
  app.register(updateStatusLoanByIdRoute)
}
