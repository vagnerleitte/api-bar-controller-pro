import { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware';
import { requireAdmin } from '../auth/auth.authorization';
import {
  createTenantBodySchema,
  tenantParamsSchema,
  updateTenantBodySchema
} from './tenant.schemas';
import { createTenant, getTenantById, listTenants, updateTenant } from './tenant.service';

export const tenantRoutes = async (app: FastifyInstance) => {
  app.get('/admin/tenants', {
    preHandler: [authenticate, requireAdmin]
  }, async (_request, reply) => {
    const result = await listTenants();
    return reply.status(200).send({ tenants: result.data });
  });

  app.get('/admin/tenants/:tenantId', {
    preHandler: [authenticate, requireAdmin],
    schema: { params: tenantParamsSchema }
  }, async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const result = await getTenantById(tenantId);
    if (result.statusCode !== 200) {
      return reply.status(result.statusCode).send({ message: result.message });
    }
    return reply.status(200).send(result.data);
  });

  app.post('/admin/tenants', {
    preHandler: [authenticate, requireAdmin],
    schema: { body: createTenantBodySchema }
  }, async (request, reply) => {
    const { name } = request.body as { name: string };
    const result = await createTenant(name);
    return reply.status(201).send(result.data);
  });

  app.patch('/admin/tenants/:tenantId', {
    preHandler: [authenticate, requireAdmin],
    schema: { params: tenantParamsSchema, body: updateTenantBodySchema }
  }, async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const { name } = request.body as { name: string };

    const result = await updateTenant(tenantId, name);
    if (result.statusCode !== 200) {
      return reply.status(result.statusCode).send({ message: result.message });
    }

    return reply.status(200).send(result.data);
  });
};
