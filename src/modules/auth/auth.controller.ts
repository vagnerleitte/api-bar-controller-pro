import { FastifyReply, FastifyRequest } from 'fastify';
import { listUsers, login, logout, me, refresh, register, resetPasswordByCpf } from './auth.service';

type RegisterBody = {
  personName: string;
  establishmentName: string;
  document: string;
  address: string;
  email?: string;
  phone: string;
  password: string;
};

type LoginBody = { cpf: string; password: string };
type ResetPasswordBody = { cpf: string; newPassword: string };
type RefreshBody = { refreshToken: string };
type ListUsersQuery = { search?: string; page?: number; limit?: number; tenantId?: string };

export const registerHandler = async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
  const result = await register(request.server, request.body);
  if (result.statusCode !== 201) {
    return reply.status(result.statusCode).send({ message: result.message });
  }
  return reply.status(201).send({ user: result.user, tokens: result.tokens });
};

export const loginHandler = async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
  const result = await login(request.server, request.body.cpf, request.body.password);
  if (result.statusCode !== 200) {
    return reply.status(result.statusCode).send({ message: result.message });
  }
  return reply.status(200).send({ user: result.user, tokens: result.tokens });
};

export const resetPasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { cpf, newPassword } = request.body as ResetPasswordBody;
  const result = await resetPasswordByCpf(cpf, newPassword);
  if (result.statusCode !== 200) {
    return reply.status(result.statusCode).send({ message: result.message });
  }
  return reply.status(200).send(result.data);
};

export const refreshHandler = async (request: FastifyRequest<{ Body: RefreshBody }>, reply: FastifyReply) => {
  const result = await refresh(request.server, request.body.refreshToken);
  if (result.statusCode !== 200) {
    return reply.status(result.statusCode).send({ message: result.message });
  }
  return reply.status(200).send({ tenantId: result.tenantId, tokens: result.tokens });
};

export const logoutHandler = async (request: FastifyRequest<{ Body: RefreshBody }>, reply: FastifyReply) => {
  const result = await logout(request.body.refreshToken);
  if (result.statusCode !== 204) {
    return reply.status(result.statusCode).send({ message: result.message });
  }
  return reply.status(204).send();
};

export const meHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.authUser) {
    return reply.status(401).send({ message: 'Token inválido' });
  }

  const result = await me(request.authUser);
  if (result.statusCode !== 200) {
    return reply.status(result.statusCode).send({ message: result.message });
  }

  return reply.status(200).send(result.user);
};

export const listUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.authUser) {
    return reply.status(401).send({ message: 'Token inválido' });
  }

  const query = request.query as ListUsersQuery;
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const result = await listUsers({
    user: request.authUser,
    search: query.search,
    page,
    limit,
    tenantId: query.tenantId
  });

  if ('message' in result) {
    return reply.status(result.statusCode).send({ message: result.message });
  }

  return reply.status(result.statusCode).send(result.data);
};
