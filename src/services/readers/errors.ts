export class ReaderNotFound extends Error {
  constructor() {
    super('Leitor não encontrado com id informado. Tente novamente.')
  }
}
