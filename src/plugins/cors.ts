import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { env } from '../config/env';

export const corsPlugin = fp(async (app) => {
  const configuredOrigins = env.CORS_ORIGIN === '*'
    ? []
    : env.CORS_ORIGIN.split(',').map((v) => v.trim());

  const isLocalhostRangeAllowed = (origin: string): boolean => {
    const match = origin.match(/^https?:\/\/(localhost|127\.0\.0\.1):(\d+)$/);
    if (!match) return false;
    const port = Number(match[2]);
    return port >= 3000 && port <= 3010;
  };

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGIN === '*') return callback(null, true);
      if (isLocalhostRangeAllowed(origin)) return callback(null, true);
      if (configuredOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin não permitida pelo CORS'), false);
    },
    credentials: true
  });
});
