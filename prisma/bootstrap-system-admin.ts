import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const normalizeCpf = (value: string) => value.replace(/\D/g, '');

const required = ['SYSTEM_ADMIN_NAME', 'SYSTEM_ADMIN_CPF', 'SYSTEM_ADMIN_PASSWORD'] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const run = async () => {
  const name = String(process.env.SYSTEM_ADMIN_NAME).trim();
  const cpfNormalized = normalizeCpf(String(process.env.SYSTEM_ADMIN_CPF));
  const password = String(process.env.SYSTEM_ADMIN_PASSWORD);

  if (!name) {
    throw new Error('SYSTEM_ADMIN_NAME inválido');
  }

  if (cpfNormalized.length !== 11) {
    throw new Error('SYSTEM_ADMIN_CPF deve ter 11 dígitos');
  }

  if (password.length < 6) {
    throw new Error('SYSTEM_ADMIN_PASSWORD deve ter pelo menos 6 caracteres');
  }

  const passwordHash = await argon2.hash(password);

  const existing = await prisma.user.findFirst({
    where: {
      tenantId: null,
      cpfNormalized
    }
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        role: 'system_admin',
        passwordHash,
        active: true
      }
    });

    console.log(`system_admin atualizado: ${existing.id}`);
    return;
  }

  const created = await prisma.user.create({
    data: {
      tenantId: null,
      name,
      cpfNormalized,
      role: 'system_admin',
      passwordHash,
      active: true
    }
  });

  console.log(`system_admin criado: ${created.id}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
