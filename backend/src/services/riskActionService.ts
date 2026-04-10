import { RiskActionRepository } from '../repositories/riskActionRepository.js';
import { RiskRepository } from '../repositories/riskRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Prisma } from '@prisma/client';

export class RiskActionService {
  private riskActionRepository: RiskActionRepository;
  private riskRepository: RiskRepository;
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.riskActionRepository = new RiskActionRepository();
    this.riskRepository = new RiskRepository();
    this.projectHistoryService = new ProjectHistoryService();
  }

  async getAllRiskActions() {
    return await this.riskActionRepository.findAll();
  }

  async getRiskActionById(id: string) {
    const action = await this.riskActionRepository.findById(id);
    if (!action) {
      throw new Error('Risk action not found');
    }
    return action;
  }

  async getRiskActionsByRisk(riskId: string) {
    return await this.riskActionRepository.findByRisk(riskId);
  }

  async createRiskAction(data: Prisma.RiskActionCreateInput) {
    if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
      throw new Error('Risk action description is required');
    }

    const riskId = (data as any).riskId || (data as any).risk?.connect?.id;
    if (!riskId) {
      throw new Error('Risk ID is required');
    }

    const payload: any = {
      ...data,
      id: (data as any).id || `ra${Date.now()}`,
      risk: { connect: { id: riskId } },
      status: (data as any).status || 'Pending',
      dueDate: data.dueDate && typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate,
    };

    const ownerId = (data as any).ownerId;
    if (ownerId) {
      payload.owner = { connect: { id: ownerId } };
    }

    delete payload.riskId;
    delete payload.ownerId;

    const createdAction = await this.riskActionRepository.create(payload);

    const risk = await this.riskRepository.findById(riskId);
    const projectId = risk?.projectId;
    if (projectId) {
      await this.projectHistoryService.record(projectId, 'RiskAction', createdAction.id, 'Created', { riskAction: createdAction });
    }

    return createdAction;
  }

  async updateRiskAction(id: string, data: Prisma.RiskActionUpdateInput) {
    await this.getRiskActionById(id);

    const updatePayload: any = { ...data };
    if ((data as any).ownerId) {
      updatePayload.owner = { connect: { id: (data as any).ownerId } };
      delete updatePayload.ownerId;
    }

    if ((data as any).riskId) {
      updatePayload.risk = { connect: { id: (data as any).riskId } };
      delete updatePayload.riskId;
    }

    if ((data as any).dueDate && typeof (data as any).dueDate === 'string') {
      updatePayload.dueDate = new Date((data as any).dueDate);
    }

    const updatedAction = await this.riskActionRepository.update(id, updatePayload);

    const risk = await this.riskRepository.findById(updatedAction.riskId);
    const projectId = risk?.projectId;
    if (projectId) {
      await this.projectHistoryService.record(projectId, 'RiskAction', updatedAction.id, 'Updated', { riskAction: updatedAction });
    }

    return updatedAction;
  }

  async deleteRiskAction(id: string) {
    const actionToDelete = await this.getRiskActionById(id);
    const deletedAction = await this.riskActionRepository.delete(id);

    const risk = await this.riskRepository.findById(actionToDelete.riskId);
    const projectId = risk?.projectId;
    if (projectId) {
      await this.projectHistoryService.record(projectId, 'RiskAction', actionToDelete.id, 'Deleted', { riskAction: actionToDelete });
    }

    return deletedAction;
  }
}
