import { ExpenseRepository } from '../repositories/expenseRepository';
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
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Expense description is required');
    }

    if (!data.projectId) {
      throw new Error('Project ID is required');
    }

    if (data.amount <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    return await this.expenseRepository.create(data);
  }

  async updateExpense(id: string, data: Prisma.ExpenseUpdateInput) {
    // Validate the expense exists
    await this.getExpenseById(id);

    // Business logic validation
    if (data.amount !== undefined && data.amount <= 0) {
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