import { BudgetLineRepository } from '../repositories/budgetLineRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
export class BudgetLineService {
    budgetLineRepository;
    projectHistoryService;
    constructor() {
        this.budgetLineRepository = new BudgetLineRepository();
        this.projectHistoryService = new ProjectHistoryService();
    }
    async getAllBudgetLines() {
        return await this.budgetLineRepository.findAll();
    }
    async getBudgetLineById(id) {
        const budgetLine = await this.budgetLineRepository.findById(id);
        if (!budgetLine) {
            throw new Error('Budget line not found');
        }
        return budgetLine;
    }
    async getBudgetLinesByProject(projectId) {
        return await this.budgetLineRepository.findByProject(projectId);
    }
    async createBudgetLine(data) {
        // Business logic validation
        const projectId = data.projectId || data.project?.connect?.id;
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
            throw new Error('Description is required');
        }
        if (data.plannedAmount === undefined || data.plannedAmount < 0) {
            throw new Error('Planned amount must be a positive number');
        }
        const payload = {
            ...data,
            id: data.id || `bl${Date.now()}`,
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
        // Format readable details for history
        const readableDetails = `Created BudgetLine: ${createdBudgetLine.category} ${createdBudgetLine.budgetType} "${createdBudgetLine.description}" for project "${createdBudgetLine.project.name}" with planned amount $${createdBudgetLine.plannedAmount.toLocaleString()}`;
        await this.projectHistoryService.record(projectId, 'BudgetLine', createdBudgetLine.id, 'Created', readableDetails, undefined);
        return createdBudgetLine;
    }
    async updateBudgetLine(id, data) {
        // Validate the budget line exists
        const existingLine = await this.getBudgetLineById(id);
        const payload = { ...data };
        if (payload.executionDate && typeof payload.executionDate === 'string') {
            payload.executionDate = new Date(payload.executionDate);
        }
        const updatedBudgetLine = await this.budgetLineRepository.update(id, payload);
        // Format readable details for history
        const readableDetails = `Updated BudgetLine: ${updatedBudgetLine.category} ${updatedBudgetLine.budgetType} "${updatedBudgetLine.description}" for project "${updatedBudgetLine.project.name}"`;
        await this.projectHistoryService.record(existingLine.projectId || null, 'BudgetLine', id, 'Updated', readableDetails, data.approvedBy || null);
        return updatedBudgetLine;
    }
    async deleteBudgetLine(id) {
        // Validate the budget line exists
        const budgetLineToDelete = await this.getBudgetLineById(id);
        const deletedBudgetLine = await this.budgetLineRepository.delete(id);
        // Format readable details for history
        const readableDetails = `Deleted BudgetLine: ${budgetLineToDelete.category} ${budgetLineToDelete.budgetType} "${budgetLineToDelete.description}" for project "${budgetLineToDelete.project.name}"`;
        await this.projectHistoryService.record(budgetLineToDelete.projectId || null, 'BudgetLine', id, 'Deleted', readableDetails);
        return deletedBudgetLine;
    }
}
