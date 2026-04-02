import { ExpenseRepository } from '../repositories/expenseRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
export class ExpenseService {
    expenseRepository;
    projectHistoryService;
    constructor() {
        this.expenseRepository = new ExpenseRepository();
        this.projectHistoryService = new ProjectHistoryService();
    }
    async getAllExpenses() {
        return await this.expenseRepository.findAll();
    }
    async getExpenseById(id) {
        const expense = await this.expenseRepository.findById(id);
        if (!expense) {
            throw new Error('Expense not found');
        }
        return expense;
    }
    async getExpensesByProject(projectId) {
        return await this.expenseRepository.findByProject(projectId);
    }
    async createExpense(data) {
        // Business logic validation
        if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
            throw new Error('Expense description is required');
        }
        const projectId = data.projectId || data.project?.connect?.id;
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        const amountValue = typeof data.amount === 'number' ? data.amount : undefined;
        if (amountValue !== undefined && amountValue <= 0) {
            throw new Error('Expense amount must be greater than 0');
        }
        const payload = {
            ...data,
            id: data.id || `e${Date.now()}`,
            date: data.date && typeof data.date === 'string' ? new Date(data.date) : data.date,
            project: { connect: { id: projectId } },
        };
        delete payload.projectId;
        const createdExpense = await this.expenseRepository.create(payload);
        await this.projectHistoryService.record(createdExpense.projectId, 'Expense', createdExpense.id, 'Created', { expense: createdExpense });
        return createdExpense;
    }
    async updateExpense(id, data) {
        // Validate the expense exists
        await this.getExpenseById(id);
        // Business logic validation
        const amountValue = typeof data.amount === 'number' ? data.amount : undefined;
        if (amountValue !== undefined && amountValue <= 0) {
            throw new Error('Expense amount must be greater than 0');
        }
        const updatedExpense = await this.expenseRepository.update(id, data);
        await this.projectHistoryService.record(updatedExpense.projectId, 'Expense', updatedExpense.id, 'Updated', { updates: data, expense: updatedExpense });
        return updatedExpense;
    }
    async deleteExpense(id) {
        // Validate the expense exists
        const expenseToDelete = await this.getExpenseById(id);
        const deletedExpense = await this.expenseRepository.delete(id);
        await this.projectHistoryService.record(expenseToDelete.projectId, 'Expense', expenseToDelete.id, 'Deleted', { expense: expenseToDelete });
        return deletedExpense;
    }
}
