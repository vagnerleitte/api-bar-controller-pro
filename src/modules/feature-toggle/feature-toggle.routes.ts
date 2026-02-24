import { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware';
import { requireSystemAdminAccess } from '../auth/auth.authorization';
import { deleteTenantFeatureOverride, isFeatureKey, listTenantFeatures, setTenantFeatureOverride } from './feature-toggle.service';
import { requireFeature } from './feature-toggle.middleware';
import {
  tenantFeatureParamsSchema,
  tenantParamsSchema,
  updateTenantFeatureBodySchema
} from './feature-toggle.schemas';

export const featureToggleRoutes = async (app: FastifyInstance) => {
  app.get('/features/me', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    if (!request.authUser) {
      return reply.status(401).send({ message: 'Token inválido' });
    }
    if (!request.authUser.tenantId) {
      return reply.status(403).send({ message: 'Usuário sem tenant não pode consultar features de tenant' });
    }

    const items = await listTenantFeatures(request.authUser.tenantId);
    return reply.status(200).send({
      tenantId: request.authUser.tenantId,
      features: items
    });
  });

  app.get('/features/advanced-reports/ping', {
    preHandler: [authenticate, requireFeature('advancedReports')]
  }, async (_request, reply) => {
    return reply.status(200).send({ ok: true, feature: 'advancedReports' });
  });

  app.get('/internal/clients/:tenantId/feature-toggles', {
    preHandler: [authenticate, requireSystemAdminAccess],
    schema: { params: tenantParamsSchema }
  }, async (request, reply) => {
    const { tenantId } = request.params as { tenantId: string };
    const items = await listTenantFeatures(tenantId);
    return reply.status(200).send({ tenantId, features: items });
  });

  app.put('/internal/clients/:tenantId/feature-toggles/:featureKey', {
    preHandler: [authenticate, requireSystemAdminAccess],
    schema: {
      params: tenantFeatureParamsSchema,
      body: updateTenantFeatureBodySchema
    }
  }, async (request, reply) => {
    const { tenantId, featureKey } = request.params as { tenantId: string; featureKey: string };
    const { enabled } = request.body as { enabled: boolean };

    if (!isFeatureKey(featureKey)) {
      return reply.status(400).send({ message: 'Feature inválida' });
    }

    const result = await setTenantFeatureOverride(tenantId, featureKey, enabled);
    if (result.statusCode !== 200) {
      return reply.status(result.statusCode).send({ message: result.message });
    }

    return reply.status(200).send(result.data);
  });

  app.delete('/internal/clients/:tenantId/feature-toggles/:featureKey', {
    preHandler: [authenticate, requireSystemAdminAccess],
    schema: {
      params: tenantFeatureParamsSchema
    }
  }, async (request, reply) => {
    const { tenantId, featureKey } = request.params as { tenantId: string; featureKey: string };

    if (!isFeatureKey(featureKey)) {
      return reply.status(400).send({ message: 'Feature inválida' });
    }

    const result = await deleteTenantFeatureOverride(tenantId, featureKey);
    if (result.statusCode !== 204) {
      return reply.status(result.statusCode).send({ message: result.message });
    }

    return reply.status(204).send();
  });
};
