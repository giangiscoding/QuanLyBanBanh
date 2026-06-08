import { PrismaClient } from '@prisma/client';

// PrismaClient dung chung cho toan bo app (singleton)
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log('✅ Da ket noi PostgreSQL');
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
