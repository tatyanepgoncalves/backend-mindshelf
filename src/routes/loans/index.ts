import type { FastifyInstance } from 'fastify'
import { createLoanRoute } from './createLoanRoute.js'
import { deleteLoanItemRoute } from './deleteLoanItemRoute.js'
import { getLoanByIdRoute } from './getLoanByIdRoute.js'
import { getLoansByUserRoute } from './getLoansByUserRoute.js'
import { getLoansRoute } from './getLoansRoute.js'
import { updateStatusLoanByIdRoute } from './updateStatusLoanByIdRoute.js'

// biome-ignore lint/suspicious/useAwait: it not necessary
export async function loansRoutes(app: FastifyInstance) {
  app.register(getLoansRoute)
  app.register(getLoanByIdRoute)
  app.register(getLoansByUserRoute)
  app.register(createLoanRoute)
  app.register(updateStatusLoanByIdRoute)
  app.register(deleteLoanItemRoute)
}
