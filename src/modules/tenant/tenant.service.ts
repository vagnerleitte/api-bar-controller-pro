import { prisma } from '../../shared/prisma';

export const listTenants = async () => {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return { statusCode: 200 as const, data: tenants };
};

export const getTenantById = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    return { statusCode: 404 as const, message: 'Tenant não encontrado' };
  }
  return { statusCode: 200 as const, data: tenant };
};

export const createTenant = async (name: string) => {
  const tenant = await prisma.tenant.create({
    data: { name: name.trim() }
  });
  return { statusCode: 201 as const, data: tenant };
};

export const updateTenant = async (tenantId: string, name: string) => {
  const existing = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!existing) {
    return { statusCode: 404 as const, message: 'Tenant não encontrado' };
  }

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { name: name.trim() }
  });

  return { statusCode: 200 as const, data: tenant };
};
