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

  const toggles = [
    { key: 'mensalistas', description: 'Gestao de mensalistas', defaultEnabled: false },
    { key: 'comandas', description: 'Gestao de comandas', defaultEnabled: true },
    { key: 'vendasAvulsas', description: 'Vendas avulsas', defaultEnabled: true },
    { key: 'relatorios', description: 'Relatorios', defaultEnabled: false },
    { key: 'usuarios', description: 'Gestao de usuarios', defaultEnabled: true },
    { key: 'cadastro', description: 'Cadastro', defaultEnabled: true },
    { key: 'authV1', description: 'Autenticacao REST V1', defaultEnabled: true },
    { key: 'salesModule', description: 'Modulo de vendas', defaultEnabled: true },
    { key: 'inventoryModule', description: 'Modulo de estoque', defaultEnabled: false },
    { key: 'advancedReports', description: 'Relatorios avancados', defaultEnabled: false }
  ];

  for (const toggle of toggles) {
    await prisma.featureToggle.upsert({
      where: { key: toggle.key },
      update: {
        description: toggle.description,
        defaultEnabled: toggle.defaultEnabled
      },
      create: {
        key: toggle.key,
        description: toggle.description,
        defaultEnabled: toggle.defaultEnabled
      }
    });
  }

  console.log('Seed finalizado. Login: CPF 12345678901 | Senha Admin@123');
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
