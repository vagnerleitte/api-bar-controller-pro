import { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware';
import { requireSystemAdminAccess } from '../auth/auth.authorization';
import { listTenants } from './tenant.service';

export const tenantRoutes = async (app: FastifyInstance) => {
  app.get('/internal/clients', {
    preHandler: [authenticate, requireSystemAdminAccess]
  }, async (_request, reply) => {
    const result = await listTenants();
    return reply.status(200).send({ clients: result.data });
  });

  app.get('/internal/tenants', {
    preHandler: [authenticate, requireSystemAdminAccess]
  }, async (_request, reply) => {
    const result = await listTenants();
    return reply.status(200).send({ tenants: result.data });
  });
};
