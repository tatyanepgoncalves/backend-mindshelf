export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Usuário com email ou telefone já cadastrado.')
  }
}

export class CredentialsInvalidError extends Error {
  constructor() {
    super('Credenciais de acesso inválidas. Tente novamente.')
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('Usuário com as credenciais fornecidas não encontrado.')
  }
}
