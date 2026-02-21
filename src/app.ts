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

type ValidationIssue = {
  field: string;
  message: string;
};

const toDotPath = (instancePath: string): string => {
  const cleaned = instancePath.replace(/^\//, '').replace(/\//g, '.');
  return cleaned || 'body';
};

const formatValidationErrors = (validation: unknown): ValidationIssue[] => {
  if (!Array.isArray(validation)) return [];

  return validation.map((err) => {
    if (!err || typeof err !== 'object') {
      return { field: 'body', message: 'valor inválido' };
    }

    const e = err as {
      instancePath?: string;
      keyword?: string;
      message?: string;
      params?: Record<string, unknown>;
    };

    const fieldFromPath = toDotPath(e.instancePath ?? '');

    if (e.keyword === 'required') {
      const missing = typeof e.params?.missingProperty === 'string'
        ? String(e.params.missingProperty)
        : 'campo';
      return { field: `body.${missing}`, message: 'campo obrigatório' };
    }

    if (e.keyword === 'additionalProperties') {
      const prop = typeof e.params?.additionalProperty === 'string'
        ? String(e.params.additionalProperty)
        : 'desconhecido';
      return { field: `body.${prop}`, message: 'campo não permitido' };
    }

    if (e.keyword === 'format') {
      return { field: fieldFromPath, message: 'formato inválido' };
    }

    if (e.keyword === 'minLength') {
      const limit = typeof e.params?.limit === 'number' ? e.params.limit : undefined;
      return { field: fieldFromPath, message: limit ? `mínimo de ${limit} caracteres` : 'tamanho mínimo não atendido' };
    }

    if (e.keyword === 'maxLength') {
      const limit = typeof e.params?.limit === 'number' ? e.params.limit : undefined;
      return { field: fieldFromPath, message: limit ? `máximo de ${limit} caracteres` : 'tamanho máximo excedido' };
    }

    return {
      field: fieldFromPath,
      message: e.message ?? 'valor inválido'
    };
  });
};

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
      const validation = (error as { validation?: unknown }).validation;
      const errors = formatValidationErrors(validation);
      return reply.status(400).send({
        message: 'Payload inválido',
        errors
      });
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
