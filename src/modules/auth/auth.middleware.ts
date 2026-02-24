import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtPayload } from './auth.types';
import { getScopeForRole } from './auth.authorization';

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: {
      id: string;
      tenantId: string | null;
      role: 'owner' | 'operator' | 'system_admin' | 'backoffice_operator' | 'seller' | 'admin';
      scope: 'tenant' | 'global';
    };
  }
}

const useBypassAuth = (request: FastifyRequest): boolean => {
  if (!request.server.env.AUTH_BYPASS_ENABLED) return false;
  if (request.server.env.NODE_ENV === 'production') return false;

  const authHeader = request.headers.authorization;
  if (!authHeader) return false;

  const [scheme, token] = authHeader.split(' ');
  if (!scheme || !token) return false;
  return scheme.toLowerCase() === 'bearer';
};

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  if (useBypassAuth(request)) {
    const bypassRole = request.server.env.AUTH_BYPASS_ROLE as JwtPayload['role'];
    request.authUser = {
      id: request.server.env.AUTH_BYPASS_USER_ID,
      tenantId: request.server.env.AUTH_BYPASS_TENANT_ID,
      role: bypassRole,
      scope: getScopeForRole(bypassRole)
    };
    request.log.warn('AUTH BYPASS ativo para request autenticada');
    return;
  }

  try {
    await request.jwtVerify<JwtPayload>();
    const payload = request.user as JwtPayload;
    const scope = payload.scope ?? getScopeForRole(payload.role);

    if (!payload.sub || !payload.role) {
      return reply.status(401).send({ message: 'Token inválido' });
    }

    if (scope === 'tenant' && !payload.tenantId) {
      return reply.status(401).send({ message: 'Token inválido' });
    }

    request.authUser = {
      id: payload.sub,
      tenantId: payload.tenantId ?? null,
      role: payload.role,
      scope
    };
  } catch {
    return reply.status(401).send({ message: 'Token inválido' });
  }
};
