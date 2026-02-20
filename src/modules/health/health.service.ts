import { prisma } from '../../shared/prisma';

const checkDatabase = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

const checkRuntime = (): boolean => {
  return process.uptime() >= 0;
};

export const isApplicationHealthy = async (): Promise<boolean> => {
  const [dbOk] = await Promise.all([
    checkDatabase()
  ]);

  const runtimeOk = checkRuntime();
  return dbOk && runtimeOk;
};
