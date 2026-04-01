import { ExpenseService } from '../services/expenseService.js';
export class ExpenseController {
    expenseService;
    constructor() {
        this.expenseService = new ExpenseService();
    }
    async getAllExpenses(req, res) {
        try {
            const expenses = await this.expenseService.getAllExpenses();
            res.json(expenses);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch expenses' });
        }
    }
    async getExpenseById(req, res) {
        try {
            const { id } = req.params;
            const expense = await this.expenseService.getExpenseById(id);
            res.json(expense);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Expense not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to fetch expense' });
            }
        }
    }
    async getExpensesByProject(req, res) {
        try {
            const { projectId } = req.params;
            const expenses = await this.expenseService.getExpensesByProject(projectId);
            res.json(expenses);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch expenses by project' });
        }
    }
    async createExpense(req, res) {
        try {
            const data = req.body;
            const expense = await this.expenseService.createExpense(data);
            res.status(201).json(expense);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to create expense' });
            }
        }
    }
    async updateExpense(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const expense = await this.expenseService.updateExpense(id, data);
            res.json(expense);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Expense not found') {
                res.status(404).json({ error: error.message });
            }
            else if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to update expense' });
            }
        }
    }
    async deleteExpense(req, res) {
        try {
            const { id } = req.params;
            await this.expenseService.deleteExpense(id);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Expense not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to delete expense' });
            }
        }
    }
}
