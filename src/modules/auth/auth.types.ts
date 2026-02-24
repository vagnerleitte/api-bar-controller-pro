export type PublicRole = 'owner' | 'operator' | 'system_admin' | 'backoffice_operator';
export type LegacyRole = 'seller' | 'admin';
export type Role = PublicRole | LegacyRole;

export type Scope = 'tenant' | 'global';

export type JwtPayload = {
  sub: string;
  tenantId?: string | null;
  role: Role;
  scope?: Scope;
};

export type AuthenticatedUser = {
  id: string;
  tenantId: string | null;
  role: Role;
  scope: Scope;
};
