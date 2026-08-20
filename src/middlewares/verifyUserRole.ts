import type { FastifyReply, FastifyRequest } from 'fastify'

export function verifyUserRole(
  roleToVerify: 'VOLUNTARIO' | 'ADMIN' | 'LEITOR'
) {
  // biome-ignore lint/suspicious/useAwait: Await is not necessary
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        message: 'Não autorizado: nenhum usuário autenticado.',
      })
    }

    const { role } = request.user

    if (role !== roleToVerify) {
      return reply.status(403).send({
        message: `Acesso negado: A função necessária é ${roleToVerify}, mas você é ${role}.`,
      })
    }
  }
}
