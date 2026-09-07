export class ReaderNotFoundError extends Error {
  constructor() {
    super('Leitor não encontrado.')
  }
}

export class BookNotFoundError extends Error {
  constructor() {
    super('Livro não encontrado.')
  }
}

export class BookAlreadyReservedError extends Error {
  constructor() {
    super('Este leitor já possui uma reserva ativa para este mesmo livro.')
  }
}

export class MaxReservationsExceededError extends Error {
  constructor(currentTotal: number) {
    super(
      `Limite excedido. O leitor já possui ${currentTotal} itens ativos (reservas ou empréstimos). O máximo permitido é 3.`
    )
  }
}
