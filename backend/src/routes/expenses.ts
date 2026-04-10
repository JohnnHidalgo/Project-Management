import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController.js';

const router = Router();
const expenseController = new ExpenseController();

router.get('/', expenseController.getAllExpenses.bind(expenseController));
router.get('/:id', expenseController.getExpenseById.bind(expenseController));
router.get('/project/:projectId', expenseController.getExpensesByProject.bind(expenseController));
router.post('/', expenseController.createExpense.bind(expenseController));
router.put('/:id', expenseController.updateExpense.bind(expenseController));
router.delete('/:id', expenseController.deleteExpense.bind(expenseController));

export default router;
