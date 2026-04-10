import { ExpenseRepository } from '../repositories/expenseRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Prisma } from '../../dist/.prisma/client';

export class ExpenseService {
  private expenseRepository: ExpenseRepository;
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.expenseRepository = new ExpenseRepository();
    this.projectHistoryService = new ProjectHistoryService();
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

    const budgetLineId = (data as any).budgetLineId;

    const payload: any = {
      ...data,
      id: (data as any).id || `e${Date.now()}`,
      date: data.date && typeof data.date === 'string' ? new Date(data.date) : data.date,
      project: { connect: { id: projectId } },
    };

    // Handle budgetLineId - create connection if provided
    if (budgetLineId) {
      payload.budgetLine = { connect: { id: budgetLineId } };
    }

    delete payload.projectId;
    delete payload.budgetLineId;

    const createdExpense = await this.expenseRepository.create(payload);

    await this.projectHistoryService.record(
      createdExpense.projectId,
      'Expense',
      createdExpense.id,
      'Created',
      { expense: createdExpense }
    );

    return createdExpense;
  }

  async updateExpense(id: string, data: Prisma.ExpenseUpdateInput) {
    // Validate the expense exists
    await this.getExpenseById(id);

    // Business logic validation
    const amountValue = typeof (data as any).amount === 'number' ? (data as any).amount : undefined;
    if (amountValue !== undefined && amountValue <= 0) {
      throw new Error('Expense amount must be greater than 0');
    }

    const updatedExpense = await this.expenseRepository.update(id, data);

    await this.projectHistoryService.record(
      updatedExpense.projectId,
      'Expense',
      updatedExpense.id,
      'Updated',
      { updates: data, expense: updatedExpense }
    );

    return updatedExpense;
  }

  async deleteExpense(id: string) {
    // Validate the expense exists
    const expenseToDelete = await this.getExpenseById(id);

    const deletedExpense = await this.expenseRepository.delete(id);

    await this.projectHistoryService.record(
      expenseToDelete.projectId,
      'Expense',
      expenseToDelete.id,
      'Deleted',
      { expense: expenseToDelete }
    );

    return deletedExpense;
  }
}
