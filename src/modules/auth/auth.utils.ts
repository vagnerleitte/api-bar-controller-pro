import crypto from 'node:crypto';
import { env } from '../../config/env';

export const normalizeCpf = (cpf: string): string => cpf.replace(/\D/g, '');
export const normalizeDocument = (value: string): string => value.replace(/\D/g, '');

export const hashRefreshToken = (token: string): string => {
  return crypto
    .createHmac('sha256', env.REFRESH_TOKEN_PEPPER)
    .update(token)
    .digest('hex');
};

export const createRefreshToken = (): string => {
  return crypto.randomBytes(48).toString('base64url');
};

export const addDays = (date: Date, days: number): Date => {
  const out = new Date(date);
  out.setDate(out.getDate() + days);
  return out;
};
