import 'dotenv/config';
import { PrismaClient } from './dist/.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in env');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function insertHistory() {
  await prisma.projectHistory.create({
    data: {
      id: 'test-1',
      projectId: 'p1',
      entity: 'Project',
      entityId: 'p1',
      action: 'Created',
      details: { test: true },
      userId: '1'
    }
  });
  console.log('History inserted');
  process.exit(0);
}

insertHistory();
