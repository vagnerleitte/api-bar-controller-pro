import { FastifyInstance } from 'fastify';
import { loginBodySchema, logoutBodySchema, refreshBodySchema, registerBodySchema } from './auth.schemas';
import { authenticate } from './auth.middleware';
import { loginHandler, logoutHandler, meHandler, refreshHandler, registerHandler } from './auth.controller';

export const authRoutes = async (app: FastifyInstance) => {
  app.post('/auth/register', {
    schema: { body: registerBodySchema }
  }, registerHandler);

  app.post('/auth/login', {
    schema: { body: loginBodySchema },
    config: {
      rateLimit: {
        max: app.env.LOGIN_RATE_LIMIT_MAX,
        timeWindow: app.env.LOGIN_RATE_LIMIT_WINDOW
      }
    }
  }, loginHandler);

  app.post('/auth/refresh', {
    schema: { body: refreshBodySchema }
  }, refreshHandler);

  app.post('/auth/logout', {
    schema: { body: logoutBodySchema }
  }, logoutHandler);

  app.get('/auth/me', {
    preHandler: [authenticate]
  }, meHandler);
};
