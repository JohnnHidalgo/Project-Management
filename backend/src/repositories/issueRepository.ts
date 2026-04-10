import { Prisma } from '@prisma/client';
import { prisma } from '../index.js';

export class IssueRepository {
  async findAll() {
    return await prisma.issue.findMany({
      include: {
        project: true,
        task: true,
        owner: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
        task: true,
        owner: true
      }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.issue.findMany({
      where: { projectId },
      include: {
        task: true,
        owner: true
      }
    });
  }

  async create(data: Prisma.IssueCreateInput) {
    return await prisma.issue.create({
      data,
      include: {
        project: true,
        task: true,
        owner: true
      }
    });
  }

  async update(id: string, data: Prisma.IssueUpdateInput) {
    return await prisma.issue.update({
      where: { id },
      data,
      include: {
        project: true,
        task: true,
        owner: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.issue.delete({
      where: { id }
    });
  }
}
