import { Prisma } from '../../dist/.prisma/client';
import { prisma } from '../index.js';

export class BudgetLineRepository {
  async findAll() {
    return await prisma.budgetLine.findMany({
      include: {
        project: true,
        approvedByUser: true,
        expenses: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.budgetLine.findUnique({
      where: { id },
      include: {
        project: true,
        approvedByUser: true,
        expenses: true
      }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.budgetLine.findMany({
      where: { projectId },
      include: {
        project: true,
        approvedByUser: true,
        expenses: true
      }
    });
  }

  async create(data: Prisma.BudgetLineCreateInput) {
    return await prisma.budgetLine.create({
      data,
      include: {
        project: true,
        approvedByUser: true,
        expenses: true
      }
    });
  }

  async update(id: string, data: Prisma.BudgetLineUpdateInput) {
    return await prisma.budgetLine.update({
      where: { id },
      data,
      include: {
        project: true,
        approvedByUser: true,
        expenses: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.budgetLine.delete({
      where: { id }
    });
  }
}
