import { FastifyInstance } from 'fastify';
import { isApplicationHealthy } from './health.service';

export const healthRoutes = async (app: FastifyInstance) => {
  app.get('/health', async (_request, reply) => {
    const healthy = await isApplicationHealthy();

    if (!healthy) {
      return reply.status(503).send({ status: 'error' });
    }

    return reply.status(200).send({ status: 'ok' });
  });
};
