export class LoanItemNotFoundError extends Error {
  constructor() {
    super('Item de empréstimo não encontrado.')
  }
}

export class LoanItemAlreadyReturnedError extends Error {
  constructor() {
    super('Este livro já foi devolvido anteriormente.')
  }
}

export class ReaderNotFoundError extends Error {
  constructor() {
    super('Leitor não encontrado.')
  }
}

export class BookNotFoundError extends Error {
  constructor() {
    super('Um ou mais livros informados não foram encontrados.')
  }
}

export class BookAlreadyLoanedError extends Error {
  constructor(bookTitle?: string) {
    super(
      bookTitle
        ? `O livro "${bookTitle}" já possui um empréstimo ativo no momento.`
        : 'Um ou mais livros já possuem um empréstimo ativo no momento.'
    )
  }
}

export class MaxLoansExceededError extends Error {
  constructor(currentCount: number, requestedCount: number) {
    super(
      `O leitor possui ${currentCount} empréstimo(s) ativo(s). Solicitar mais ${requestedCount} ultrapassa o limite máximo de 3.`
    )
  }
}

export class DuplicateBooksInRequestError extends Error {
  constructor() {
    super(
      'Não é permitido incluir o mesmo livro mais de uma vez no mesmo empréstimo.'
    )
  }
}

export class LimitExcededLoan extends Error {
  constructor(renderActiveCount: number) {
    super(
      `Limite excedido. O leitor já possui ${renderActiveCount} empréstimos ativos.`
    )
  }
}

export class BookHasLoan extends Error {
  constructor() {
    super('Um ou mais livros já possuem empréstimos ativos.')
  }
}
