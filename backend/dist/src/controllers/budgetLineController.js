import { BudgetLineService } from '../services/budgetLineService.js';
export class BudgetLineController {
    budgetLineService;
    constructor() {
        this.budgetLineService = new BudgetLineService();
    }
    async getAll(req, res) {
        try {
            const budgetLines = await this.budgetLineService.getAllBudgetLines();
            res.json(budgetLines);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const budgetLine = await this.budgetLineService.getBudgetLineById(id);
            res.json(budgetLine);
        }
        catch (error) {
            res.status(404).json({ error: error instanceof Error ? error.message : 'Budget line not found' });
        }
    }
    async getByProject(req, res) {
        try {
            const { projectId } = req.params;
            const budgetLines = await this.budgetLineService.getBudgetLinesByProject(projectId);
            res.json(budgetLines);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async create(req, res) {
        try {
            const projectId = req.body.projectId;
            const payload = {
                id: `bl${Date.now()}`,
                description: req.body.description,
                plannedAmount: req.body.plannedAmount,
                category: req.body.category,
                budgetType: req.body.budgetType,
                status: req.body.status || 'Pending',
                project: { connect: { id: projectId } }
            };
            const createdBudgetLine = await this.budgetLineService.createBudgetLine(payload);
            res.status(201).json(createdBudgetLine);
        }
        catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid input' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const updatedBudgetLine = await this.budgetLineService.updateBudgetLine(id, req.body);
            res.json(updatedBudgetLine);
        }
        catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid input' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deletedBudgetLine = await this.budgetLineService.deleteBudgetLine(id);
            res.json(deletedBudgetLine);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
}
