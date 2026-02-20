import { FastifyReply, FastifyRequest } from 'fastify';

export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.authUser) {
    return reply.status(401).send({ message: 'Token inválido' });
  }

  if (request.authUser.role !== 'admin') {
    return reply.status(403).send({ message: 'Acesso restrito a administradores' });
  }
};
