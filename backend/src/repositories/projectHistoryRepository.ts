import { Prisma } from '../../dist/.prisma/client';
import { prisma } from '../index.js';

export class ProjectHistoryRepository {
  async findAll() {
    return await prisma.projectHistory.findMany({
      include: {
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.projectHistory.findMany({
      where: { projectId },
      include: {
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async create(data: Prisma.ProjectHistoryCreateInput) {
    return await prisma.projectHistory.create({
      data,
      include: {
        project: true
      }
    });
  }
}
