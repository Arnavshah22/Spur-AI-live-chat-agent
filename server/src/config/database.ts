import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  log: [
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Log Prisma errors and warnings
prisma.$on('error' as never, (e: any) => {
  logger.error({ error: e }, 'Prisma error');
});

prisma.$on('warn' as never, (e: any) => {
  logger.warn({ warning: e }, 'Prisma warning');
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
