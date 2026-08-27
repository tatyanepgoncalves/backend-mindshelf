import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    file?: string
    user: {
      id: string
      nome: string
      email: string
      phone: string | null
      address: string | null
      role: 'LEITOR' | 'ADMIN' | 'VOLUNTARIO'
      sub: string
    }
  }
}
