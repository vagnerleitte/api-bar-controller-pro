export type Role = 'admin' | 'seller';

export type JwtPayload = {
  sub: string;
  tenantId: string;
  role: Role;
};

export type AuthenticatedUser = {
  id: string;
  tenantId: string;
  role: Role;
};
