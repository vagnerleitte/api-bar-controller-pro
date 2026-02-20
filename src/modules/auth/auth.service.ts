import argon2 from 'argon2';
import { FastifyInstance } from 'fastify';
import { prisma } from '../../shared/prisma';
import { env } from '../../config/env';
import { addDays, createRefreshToken, hashRefreshToken, normalizeDocument } from './auth.utils';
import { AuthenticatedUser, JwtPayload } from './auth.types';

const invalidCredentialsError = 'ID do estabelecimento ou senha inválidos';
const invalidTokenError = 'Refresh token inválido';

const signAccessToken = async (app: FastifyInstance, user: AuthenticatedUser): Promise<{ accessToken: string; expiresAt: string }> => {
  const accessToken = await app.jwt.sign({ tenantId: user.tenantId, role: user.role } as JwtPayload, {
    sub: user.id,
    expiresIn: `${env.ACCESS_TOKEN_TTL_MINUTES}m`
  });
  const expiresAt = new Date(Date.now() + env.ACCESS_TOKEN_TTL_MINUTES * 60_000).toISOString();
  return { accessToken, expiresAt };
};

const issueRefreshToken = async (user: AuthenticatedUser): Promise<string> => {
  const refreshToken = createRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tenantId: user.tenantId,
      tokenHash,
      expiresAt: addDays(new Date(), env.REFRESH_TOKEN_TTL_DAYS)
    }
  });
  return refreshToken;
};

type RegisterInput = {
  personName: string;
  establishmentName: string;
  document: string;
  address: string;
  email?: string;
  phone: string;
  password: string;
};

export const register = async (app: FastifyInstance, input: RegisterInput) => {
  const documentNormalized = normalizeDocument(input.document);
  if (documentNormalized.length !== 11 && documentNormalized.length !== 14) {
    return { statusCode: 400 as const, message: 'CPF/CNPJ inválido' };
  }

  const existingTenant = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM tenants WHERE "documentNormalized" = ${documentNormalized} LIMIT 1
  `;

  if (existingTenant.length > 0) {
    return { statusCode: 400 as const, message: 'CPF/CNPJ já cadastrado' };
  }

  const passwordHash = await argon2.hash(input.password);

  const created = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.establishmentName.trim()
      }
    });

    await tx.$executeRaw`
      UPDATE tenants
      SET
        "documentNormalized" = ${documentNormalized},
        "address" = ${input.address.trim()},
        "email" = ${input.email?.trim() || null},
        "phone" = ${input.phone.trim()}
      WHERE id = ${tenant.id}
    `;

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: input.personName.trim(),
        cpfNormalized: documentNormalized.slice(0, 11),
        role: 'admin',
        passwordHash,
        active: true
      }
    });

    return { tenant, user };
  });

  const authUser: AuthenticatedUser = {
    id: created.user.id,
    tenantId: created.user.tenantId,
    role: created.user.role
  };

  const access = await signAccessToken(app, authUser);
  const refreshToken = await issueRefreshToken(authUser);

  return {
    statusCode: 201 as const,
    user: {
      id: created.user.id,
      name: created.user.name,
      role: created.user.role,
      tenantId: created.user.tenantId,
      cpf: created.user.cpfNormalized
    },
    tokens: {
      accessToken: access.accessToken,
      refreshToken,
      expiresAt: access.expiresAt
    }
  };
};

export const login = async (app: FastifyInstance, establishmentId: string, password: string) => {
  const tenantId = establishmentId.trim();
  if (!tenantId) {
    return { statusCode: 401 as const, message: invalidCredentialsError };
  }

  const users = await prisma.user.findMany({
    where: { tenantId, active: true },
    take: 2
  });

  if (users.length === 0) {
    const inactiveUser = await prisma.user.findFirst({
      where: { tenantId, active: false }
    });
    if (inactiveUser) {
      return { statusCode: 403 as const, message: 'Usuário inativo' };
    }
    return { statusCode: 401 as const, message: invalidCredentialsError };
  }

  if (users.length > 1) {
    return { statusCode: 401 as const, message: invalidCredentialsError };
  }
  const user = users[0];

  if (!user.active) {
    return { statusCode: 403 as const, message: 'Usuário inativo' };
  }

  const validPassword = await argon2.verify(user.passwordHash, password);
  if (!validPassword) {
    return { statusCode: 401 as const, message: invalidCredentialsError };
  }

  const authUser: AuthenticatedUser = {
    id: user.id,
    tenantId: user.tenantId,
    role: user.role
  };

  const access = await signAccessToken(app, authUser);
  const refreshToken = await issueRefreshToken(authUser);

  return {
    statusCode: 200 as const,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      cpf: user.cpfNormalized
    },
    tokens: {
      accessToken: access.accessToken,
      refreshToken,
      expiresAt: access.expiresAt
    }
  };
};

export const refresh = async (app: FastifyInstance, rawRefreshToken: string) => {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const now = new Date();

  const token = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: now }
    }
  });

  if (!token) {
    return { statusCode: 401 as const, message: invalidTokenError };
  }

  const user = await prisma.user.findUnique({ where: { id: token.userId } });
  if (!user || !user.active || user.tenantId !== token.tenantId) {
    return { statusCode: 401 as const, message: invalidTokenError };
  }

  const newRefreshToken = createRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: token.id },
      data: { revokedAt: now }
    });

    await tx.refreshToken.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        tokenHash: newRefreshTokenHash,
        expiresAt: addDays(now, env.REFRESH_TOKEN_TTL_DAYS)
      }
    });
  });

  const authUser: AuthenticatedUser = {
    id: user.id,
    tenantId: user.tenantId,
    role: user.role
  };

  const access = await signAccessToken(app, authUser);
  const refreshToken = newRefreshToken;

  return {
    statusCode: 200 as const,
    tenantId: user.tenantId,
    tokens: {
      accessToken: access.accessToken,
      refreshToken,
      expiresAt: access.expiresAt
    }
  };
};

export const logout = async (rawRefreshToken: string) => {
  const tokenHash = hashRefreshToken(rawRefreshToken);

  const token = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null }
  });

  if (!token) {
    return { statusCode: 401 as const, message: invalidTokenError };
  }

  await prisma.refreshToken.update({
    where: { id: token.id },
    data: { revokedAt: new Date() }
  });

  return { statusCode: 204 as const };
};

export const me = async (user: AuthenticatedUser) => {
  const dbUser = await prisma.user.findFirst({
    where: {
      id: user.id,
      tenantId: user.tenantId
    }
  });

  if (!dbUser) {
    return { statusCode: 401 as const, message: 'Token inválido' };
  }

  if (!dbUser.active) {
    return { statusCode: 403 as const, message: 'Usuário inativo' };
  }

  return {
    statusCode: 200 as const,
    user: {
      id: dbUser.id,
      name: dbUser.name,
      role: dbUser.role,
      tenantId: dbUser.tenantId,
      cpf: dbUser.cpfNormalized
    }
  };
};
