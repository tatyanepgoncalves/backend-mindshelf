import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    file?: string
    user: {
      id: string
      nome: string
      email: string
      phone: string
      address: string
      role: 'LEITOR' | 'ADMIN' | 'VOLUNTARIO'
    }
  }
}
