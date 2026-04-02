import { BudgetLineService } from '../services/budgetLineService.js';
import { Prisma } from '../../.prisma/client';

export class BudgetLineController {
  private budgetLineService: BudgetLineService;

  constructor() {
    this.budgetLineService = new BudgetLineService();
  }

  async getAll(req: any, res: any) {
    try {
      const budgetLines = await this.budgetLineService.getAllBudgetLines();
      res.json(budgetLines);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getById(req: any, res: any) {
    try {
      const { id } = req.params;
      const budgetLine = await this.budgetLineService.getBudgetLineById(id);
      res.json(budgetLine);
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Budget line not found' });
    }
  }

  async getByProject(req: any, res: any) {
    try {
      const { projectId } = req.params;
      const budgetLines = await this.budgetLineService.getBudgetLinesByProject(projectId);
      res.json(budgetLines);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async create(req: any, res: any) {
    try {
      const projectId = req.body.projectId;
      const payload: Prisma.BudgetLineCreateInput = {
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
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid input' });
    }
  }

  async update(req: any, res: any) {
    try {
      const { id } = req.params;
      const updatedBudgetLine = await this.budgetLineService.updateBudgetLine(id, req.body);
      res.json(updatedBudgetLine);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid input' });
    }
  }

  async delete(req: any, res: any) {
    try {
      const { id } = req.params;
      const deletedBudgetLine = await this.budgetLineService.deleteBudgetLine(id);
      res.json(deletedBudgetLine);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
