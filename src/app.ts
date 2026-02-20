import Fastify from 'fastify';
import { env } from './config/env';
import { corsPlugin } from './plugins/cors';
import { jwtPlugin } from './plugins/jwt';
import { rateLimitPlugin } from './plugins/rateLimit';
import { authRoutes } from './modules/auth/auth.routes';
import { featureTogglePlugin } from './plugins/feature-toggle';
import { featureToggleRoutes } from './modules/feature-toggle/feature-toggle.routes';
import { swaggerPlugin } from './plugins/swagger';
import { tenantRoutes } from './modules/tenant/tenant.routes';
import { healthRoutes } from './modules/health/health.routes';

declare module 'fastify' {
  interface FastifyInstance {
    env: typeof env;
  }
}

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.decorate('env', env);

  app.register(corsPlugin);
  app.register(rateLimitPlugin);
  app.register(jwtPlugin);
  app.register(featureTogglePlugin);
  app.register(swaggerPlugin);

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error
      ? Number((error as { statusCode?: number }).statusCode)
      : undefined;
    const message = error instanceof Error ? error.message : 'Erro inesperado';
    const hasValidation = typeof error === 'object' && error !== null && 'validation' in error;

    if (hasValidation) {
      return reply.status(400).send({ message: 'Payload inválido' });
    }

    if (statusCode === 429) {
      return reply.status(429).send({ message: 'Muitas tentativas. Tente novamente em instantes.' });
    }

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({ message });
    }

    app.log.error({ err: message }, 'Internal server error');
    return reply.status(500).send({ message: 'Erro interno do servidor' });
  });

  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(featureToggleRoutes);
  app.register(tenantRoutes);

  return app;
};
