import 'dotenv/config';
import { PrismaClient } from './dist/.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function updateProjects() {
  try {
    // Update existing projects with pmCanEdit field
    await prisma.project.updateMany({
      where: { status: 'Active' },
      data: { pmCanEdit: true }
    });

    await prisma.project.updateMany({
      where: { status: 'Draft' },
      data: { pmCanEdit: false }
    });

    await prisma.project.updateMany({
      where: { status: 'Completed' },
      data: { pmCanEdit: true }
    });

    console.log('Projects updated successfully');
  } catch (error) {
    console.error('Error updating projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjects();