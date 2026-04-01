import { Prisma } from '../../.prisma/client';
import { prisma } from '../index.js';

export class ExpenseRepository {
  async findAll() {
    return await prisma.expense.findMany({
      include: {
        project: true,
        budgetLine: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.expense.findUnique({
      where: { id },
      include: {
        project: true,
        budgetLine: true
      }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.expense.findMany({
      where: { projectId },
      include: {
        budgetLine: true
      }
    });
  }

  async create(data: Prisma.ExpenseCreateInput) {
    return await prisma.expense.create({
      data,
      include: {
        project: true,
        budgetLine: true
      }
    });
  }

  async update(id: string, data: Prisma.ExpenseUpdateInput) {
    return await prisma.expense.update({
      where: { id },
      data,
      include: {
        project: true,
        budgetLine: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.expense.delete({
      where: { id }
    });
  }
}