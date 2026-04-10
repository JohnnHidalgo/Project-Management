import { Prisma } from '@prisma/client';
import { prisma } from '../index.js';

export class MilestoneRepository {
  async findAll() {
    return await prisma.milestone.findMany({
      include: {
        project: true,
        tasks: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.milestone.findUnique({
      where: { id },
      include: {
        project: true,
        tasks: true
      }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.milestone.findMany({
      where: { projectId },
      include: {
        tasks: true
      }
    });
  }

  async create(data: Prisma.MilestoneCreateInput) {
    return await prisma.milestone.create({
      data,
      include: {
        project: true,
        tasks: true
      }
    });
  }

  async update(id: string, data: Prisma.MilestoneUpdateInput) {
    return await prisma.milestone.update({
      where: { id },
      data,
      include: {
        project: true,
        tasks: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.milestone.delete({
      where: { id }
    });
  }
}
