import type { FastifyInstance } from 'fastify'
import { createLoanRoute } from './createLoanRoute.js'
import { getLoansRoute } from './getLoansRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function loansRoutes(app: FastifyInstance) {
  app.register(getLoansRoute)
  app.register(createLoanRoute)
}
