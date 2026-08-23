import type { FastifyReply, FastifyRequest } from 'fastify'

// biome-ignore lint/suspicious/useAwait: AWAIT is not necessary
export async function authorizeSelfOrAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string }
  // biome-ignore lint/style/useDestructuring: it's necessary
  const user = request.user
  const userId = request.user?.id
  const isAdmin = request.user.role === 'ADMIN'

  const isOwner = user.id === id || user.id === userId

  // If you are not the data owner and are not an admin, block it.
  if (!(isOwner || isAdmin)) {
    return reply.status(403).send({
      message: 'Acesso negado: você não tem permissão para este recurso.',
    })
  }
}
