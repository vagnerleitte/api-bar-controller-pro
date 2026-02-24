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

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseNumber(process.env.PORT, 3002),
  HOST: process.env.HOST ?? '0.0.0.0',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
  ACCESS_TOKEN_TTL_MINUTES: parseNumber(process.env.ACCESS_TOKEN_TTL_MINUTES, 15),
  REFRESH_TOKEN_TTL_DAYS: parseNumber(process.env.REFRESH_TOKEN_TTL_DAYS, 7),
  REFRESH_TOKEN_PEPPER: process.env.REFRESH_TOKEN_PEPPER as string,
  LOGIN_RATE_LIMIT_MAX: parseNumber(process.env.LOGIN_RATE_LIMIT_MAX, 5),
  LOGIN_RATE_LIMIT_WINDOW: process.env.LOGIN_RATE_LIMIT_WINDOW ?? '1 minute',
  FEATURE_FLAGS: process.env.FEATURE_FLAGS ?? '',
  AUTH_BYPASS_ENABLED: parseBoolean(process.env.AUTH_BYPASS_ENABLED, false),
  AUTH_BYPASS_USER_ID: process.env.AUTH_BYPASS_USER_ID ?? 'bypass-user',
  AUTH_BYPASS_TENANT_ID: process.env.AUTH_BYPASS_TENANT_ID ?? '11111111-1111-1111-1111-111111111111',
  AUTH_BYPASS_ROLE: ['owner', 'operator', 'system_admin', 'backoffice_operator', 'seller', 'admin'].includes((process.env.AUTH_BYPASS_ROLE ?? '').trim())
    ? (process.env.AUTH_BYPASS_ROLE as 'owner' | 'operator' | 'system_admin' | 'backoffice_operator' | 'seller' | 'admin')
    : 'owner'
};
