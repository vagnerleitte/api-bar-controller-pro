import { FastifyReply, FastifyRequest } from 'fastify';
import { PublicRole, Role, Scope } from './auth.types';

export const normalizeRole = (role: Role): PublicRole => {
  if (role === 'admin') return 'owner';
  if (role === 'seller') return 'operator';
  return role;
};

export const getScopeForRole = (role: Role): Scope => {
  const normalized = normalizeRole(role);
  if (normalized === 'system_admin' || normalized === 'backoffice_operator') {
    return 'global';
  }
  return 'tenant';
};

export const requireRoles = (allowed: PublicRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.authUser) {
      return reply.status(401).send({ message: 'Token inválido' });
    }

    const role = normalizeRole(request.authUser.role);
    if (!allowed.includes(role)) {
      return reply.status(403).send({ message: 'Permissão insuficiente para esta operação' });
    }
  };
};

export const requireGlobalAccess = requireRoles(['system_admin', 'backoffice_operator']);
export const requireSystemAdminAccess = requireRoles(['system_admin']);
