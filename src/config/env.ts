import dotenv from 'dotenv';

dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'REFRESH_TOKEN_PEPPER'
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseNumber(process.env.PORT, 3000),
  HOST: process.env.HOST ?? '0.0.0.0',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
  ACCESS_TOKEN_TTL_MINUTES: parseNumber(process.env.ACCESS_TOKEN_TTL_MINUTES, 15),
  REFRESH_TOKEN_TTL_DAYS: parseNumber(process.env.REFRESH_TOKEN_TTL_DAYS, 7),
  REFRESH_TOKEN_PEPPER: process.env.REFRESH_TOKEN_PEPPER as string,
  LOGIN_RATE_LIMIT_MAX: parseNumber(process.env.LOGIN_RATE_LIMIT_MAX, 5),
  LOGIN_RATE_LIMIT_WINDOW: process.env.LOGIN_RATE_LIMIT_WINDOW ?? '1 minute',
  FEATURE_FLAGS: process.env.FEATURE_FLAGS ?? ''
};
