import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const run = async () => {
  const tenant = await prisma.tenant.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Bar Demo'
    }
  });

  await prisma.$executeRaw`
    UPDATE tenants
    SET
      "documentNormalized" = '12345678901',
      "address" = 'Rua Demo, 100',
      "email" = 'demo@bar.com',
      "phone" = '11999999999'
    WHERE id = ${tenant.id}
  `;

  const passwordHash = await argon2.hash('Admin@123');

  await prisma.user.upsert({
    where: {
      tenantId_cpfNormalized: {
        tenantId: tenant.id,
        cpfNormalized: '12345678901'
      }
    },
    update: {
      active: true,
      passwordHash
    },
    create: {
      tenantId: tenant.id,
      name: 'Admin Demo',
      cpfNormalized: '12345678901',
      role: 'admin',
      passwordHash,
      active: true
    }
  });

  await prisma.featureToggle.upsert({
    where: { key: 'authV1' },
    update: { description: 'Autenticacao REST V1', defaultEnabled: true },
    create: { key: 'authV1', description: 'Autenticacao REST V1', defaultEnabled: true }
  });

  await prisma.featureToggle.upsert({
    where: { key: 'salesModule' },
    update: { description: 'Modulo de vendas', defaultEnabled: true },
    create: { key: 'salesModule', description: 'Modulo de vendas', defaultEnabled: true }
  });

  await prisma.featureToggle.upsert({
    where: { key: 'inventoryModule' },
    update: { description: 'Modulo de estoque', defaultEnabled: false },
    create: { key: 'inventoryModule', description: 'Modulo de estoque', defaultEnabled: false }
  });

  await prisma.featureToggle.upsert({
    where: { key: 'advancedReports' },
    update: { description: 'Relatorios avancados', defaultEnabled: false },
    create: { key: 'advancedReports', description: 'Relatorios avancados', defaultEnabled: false }
  });

  console.log('Seed finalizado. Login: establishmentId 11111111-1111-1111-1111-111111111111 | Senha Admin@123');
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
