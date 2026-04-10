import { Request, Response } from 'express';
import { ExpenseService } from '../services/expenseService.js';
import { Prisma } from '../../dist/.prisma/client';

export class ExpenseController {
  private expenseService: ExpenseService;

  constructor() {
    this.expenseService = new ExpenseService();
  }

  async getAllExpenses(req: Request, res: Response) {
    try {
      const expenses = await this.expenseService.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  }

  async getExpenseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const expense = await this.expenseService.getExpenseById(id);
      res.json(expense);
    } catch (error) {
      if (error instanceof Error && error.message === 'Expense not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch expense' });
      }
    }
  }

  async getExpensesByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const expenses = await this.expenseService.getExpensesByProject(projectId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch expenses by project' });
    }
  }

  async createExpense(req: Request, res: Response) {
    try {
      const data = req.body;
      const expense = await this.expenseService.createExpense(data);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create expense' });
      }
    }
  }

  async updateExpense(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const expense = await this.expenseService.updateExpense(id, data);
      res.json(expense);
    } catch (error) {
      if (error instanceof Error && error.message === 'Expense not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update expense' });
      }
    }
  }

  async deleteExpense(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.expenseService.deleteExpense(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Expense not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete expense' });
      }
    }
  }
}
