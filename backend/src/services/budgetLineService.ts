import { BudgetLineRepository } from '../repositories/budgetLineRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Prisma } from '../../.prisma/client';

export class BudgetLineService {
  private budgetLineRepository: BudgetLineRepository;
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.budgetLineRepository = new BudgetLineRepository();
    this.projectHistoryService = new ProjectHistoryService();
  }

  async getAllBudgetLines() {
    return await this.budgetLineRepository.findAll();
  }

  async getBudgetLineById(id: string) {
    const budgetLine = await this.budgetLineRepository.findById(id);
    if (!budgetLine) {
      throw new Error('Budget line not found');
    }
    return budgetLine;
  }

  async getBudgetLinesByProject(projectId: string) {
    return await this.budgetLineRepository.findByProject(projectId);
  }

  async createBudgetLine(data: Prisma.BudgetLineCreateInput) {
    // Business logic validation
    const projectId = (data as any).projectId || (data as any).project?.connect?.id;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
      throw new Error('Description is required');
    }

    if ((data as any).plannedAmount === undefined || (data as any).plannedAmount < 0) {
      throw new Error('Planned amount must be a positive number');
    }

    const payload: any = {
      ...data,
      id: (data as any).id || `bl${Date.now()}`,
    };

    if (!payload.project) {
      payload.project = { connect: { id: projectId } };
    }

    if (payload.executionDate && typeof payload.executionDate === 'string') {
      payload.executionDate = new Date(payload.executionDate);
    }

    if (!payload.executionDate) {
      throw new Error('Execution date is required');
    }

    delete payload.projectId;

    const createdBudgetLine = await this.budgetLineRepository.create(payload);

    await this.projectHistoryService.record(
      projectId,
      'BudgetLine',
      createdBudgetLine.id,
      'Created',
      { budgetLine: createdBudgetLine },
      undefined
    );

    return createdBudgetLine;
  }

  async updateBudgetLine(id: string, data: Prisma.BudgetLineUpdateInput) {
    // Validate the budget line exists
    const existingLine = await this.getBudgetLineById(id);

    const payload: any = { ...data };
    if (payload.executionDate && typeof payload.executionDate === 'string') {
      payload.executionDate = new Date(payload.executionDate);
    }

    const updatedBudgetLine = await this.budgetLineRepository.update(id, payload);

    await this.projectHistoryService.record(
      existingLine.projectId || null,
      'BudgetLine',
      id,
      'Updated',
      { updates: data, budgetLine: updatedBudgetLine },
      (data as any).approvedBy || null
    );

    return updatedBudgetLine;
  }

  async deleteBudgetLine(id: string) {
    // Validate the budget line exists
    const budgetLineToDelete = await this.getBudgetLineById(id);

    const deletedBudgetLine = await this.budgetLineRepository.delete(id);

    await this.projectHistoryService.record(
      budgetLineToDelete.projectId || null,
      'BudgetLine',
      id,
      'Deleted',
      { budgetLine: budgetLineToDelete }
    );

    return deletedBudgetLine;
  }
}
