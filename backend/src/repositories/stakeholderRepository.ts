import { Prisma } from '../../.prisma/client';
import { prisma } from '../index';

export class StakeholderRepository {
  async findAll() {
    return await prisma.stakeholder.findMany({
      include: {
        project: true,
        user: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.stakeholder.findUnique({
      where: { id },
      include: {
        project: true,
        user: true
      }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.stakeholder.findMany({
      where: { projectId },
      include: {
        user: true
      }
    });
  }

  async create(data: Prisma.StakeholderCreateInput) {
    return await prisma.stakeholder.create({
      data,
      include: {
        project: true,
        user: true
      }
    });
  }

  async update(id: string, data: Prisma.StakeholderUpdateInput) {
    return await prisma.stakeholder.update({
      where: { id },
      data,
      include: {
        project: true,
        user: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.stakeholder.delete({
      where: { id }
    });
  }
}