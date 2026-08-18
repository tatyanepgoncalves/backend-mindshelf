import type { FastifyReply, FastifyRequest } from 'fastify'

// biome-ignore lint/suspicious/useAwait: AWAIT is not necessary
export async function authorizeSelf(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string }
  // biome-ignore lint/style/useDestructuring: it's necessary
  const user = request.user

  const isOwner = user.id === id

  // If you are not the data owner and are not an admin, block it.
  if (!isOwner) {
    return reply.status(403).send({
      message: 'Acesso negado: você não tem permissão para este recurso.',
    })
  }
}
