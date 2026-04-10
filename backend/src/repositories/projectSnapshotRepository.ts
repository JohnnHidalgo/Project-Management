import { Prisma, ProjectSnapshot } from '../../dist/.prisma/client';
import { prisma } from '../index.js';

export class ProjectSnapshotRepository {
  async findAll() {
    return await prisma.projectSnapshot.findMany();
  }

  async findById(id: string) {
    return await prisma.projectSnapshot.findUnique({
      where: { id }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.projectSnapshot.findMany({
      where: { projectId },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async create(data: Prisma.ProjectSnapshotCreateInput) {
    return await prisma.projectSnapshot.create({
      data
    });
  }
}
