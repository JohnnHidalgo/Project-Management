import { ExpenseRepository } from '../repositories/expenseRepository.js';
import { Prisma } from '../../.prisma/client';

export class ExpenseService {
  private expenseRepository: ExpenseRepository;

  constructor() {
    this.expenseRepository = new ExpenseRepository();
  }

  async getAllExpenses() {
    return await this.expenseRepository.findAll();
  }

  async getExpenseById(id: string) {
    const expense = await this.expenseRepository.findById(id);
    if (!expense) {
      throw new Error('Expense not found');
    }
    return expense;
  }

  async getExpensesByProject(projectId: string) {
    return await this.expenseRepository.findByProject(projectId);
  }

  async createExpense(data: Prisma.ExpenseCreateInput) {
    // Business logic validation
    if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
      throw new Error('Expense description is required');
    }

    const projectId = (data as any).projectId || (data as any).project?.connect?.id;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const amountValue = typeof (data as any).amount === 'number' ? (data as any).amount : undefined;
    if (amountValue !== undefined && amountValue <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    const payload: any = {
      ...data,
      id: (data as any).id || `e${Date.now()}`,
      date: data.date && typeof data.date === 'string' ? new Date(data.date) : data.date,
      project: { connect: { id: projectId } },
    };

    delete payload.projectId;

    return await this.expenseRepository.create(payload);
  }

  async updateExpense(id: string, data: Prisma.ExpenseUpdateInput) {
    // Validate the expense exists
    await this.getExpenseById(id);

    // Business logic validation
    const amountValue = typeof (data as any).amount === 'number' ? (data as any).amount : undefined;
    if (amountValue !== undefined && amountValue <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    return await this.expenseRepository.update(id, data);
  }

  async deleteExpense(id: string) {
    // Validate the expense exists
    await this.getExpenseById(id);

    return await this.expenseRepository.delete(id);
  }
}