import type { FastifyReply, FastifyRequest } from 'fastify'

// biome-ignore lint/suspicious/useAwait: AWAIT is not necessary
export async function authorizeAdminOrVolunteer(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userRole = request.user.role

  const isOwner = userRole === 'ADMIN' || userRole === 'VOLUNTARIO'

  // If you are not the data owner and are not an admin, block it.
  if (!isOwner) {
    return reply.status(403).send({
      message: 'Acesso negado: você não tem permissão para este recurso.',
    })
  }
}
