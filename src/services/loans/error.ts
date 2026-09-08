export class LoansNotFoundError extends Error {
  constructor() {
    super('Nenhum empréstimo encontrado com os critérios especificados.')
  }
}
