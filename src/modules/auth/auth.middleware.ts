import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtPayload } from './auth.types';

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: {
      id: string;
      tenantId: string;
      role: 'admin' | 'seller';
    };
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify<JwtPayload>();
    const payload = request.user as JwtPayload;

    if (!payload.sub || !payload.tenantId || !payload.role) {
      return reply.status(401).send({ message: 'Token inválido' });
    }

    request.authUser = {
      id: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role
    };
  } catch {
    return reply.status(401).send({ message: 'Token inválido' });
  }
};
