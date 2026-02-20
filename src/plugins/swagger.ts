import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'node:path';

export const swaggerPlugin = fp(async (app) => {
  await app.register(swagger, {
    mode: 'static',
    specification: {
      path: path.join(process.cwd(), 'docs/openapi-auth-v1.yaml'),
      baseDir: process.cwd()
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: false,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    }
  });
});
