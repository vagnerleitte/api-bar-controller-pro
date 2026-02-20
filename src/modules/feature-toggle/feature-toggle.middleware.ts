import { FastifyReply, FastifyRequest } from 'fastify';
import { FeatureKey } from './feature-catalog';

export const requireFeature = (feature: FeatureKey) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.authUser) {
      return reply.status(401).send({ message: 'Token inválido' });
    }

    const enabled = await request.server.featureToggle.isEnabled(feature, request.authUser.tenantId);
    if (!enabled) {
      return reply.status(403).send({ message: `Feature ${feature} desabilitada para este estabelecimento` });
    }
  };
};
