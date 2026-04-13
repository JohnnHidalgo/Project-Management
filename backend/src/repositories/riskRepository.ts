import { Prisma } from '../../.prisma/client';
import { prisma } from '../index.js';

export class RiskRepository {
  async findAll() {
    return await prisma.risk.findMany({
      include: {
        project: true,
        owner: true,
        actions: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.risk.findUnique({
      where: { id },
      include: {
        project: true,
        owner: true,
        actions: true
      }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.risk.findMany({
      where: { projectId },
      include: {
        owner: true,
        actions: true
      }
    });
  }

  async create(data: Prisma.RiskCreateInput) {
    return await prisma.risk.create({
      data,
      include: {
        project: true,
        owner: true,
        actions: true
      }
    });
  }

  async update(id: string, data: Prisma.RiskUpdateInput) {
    return await prisma.risk.update({
      where: { id },
      data,
      include: {
        project: true,
        owner: true,
        actions: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.risk.delete({
      where: { id }
    });
  }
}
