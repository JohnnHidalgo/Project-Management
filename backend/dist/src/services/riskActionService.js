import { RiskActionRepository } from '../repositories/riskActionRepository.js';
import { RiskRepository } from '../repositories/riskRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
export class RiskActionService {
    riskActionRepository;
    riskRepository;
    projectHistoryService;
    constructor() {
        this.riskActionRepository = new RiskActionRepository();
        this.riskRepository = new RiskRepository();
        this.projectHistoryService = new ProjectHistoryService();
    }
    async getAllRiskActions() {
        return await this.riskActionRepository.findAll();
    }
    async getRiskActionById(id) {
        const action = await this.riskActionRepository.findById(id);
        if (!action) {
            throw new Error('Risk action not found');
        }
        return action;
    }
    async getRiskActionsByRisk(riskId) {
        return await this.riskActionRepository.findByRisk(riskId);
    }
    async createRiskAction(data) {
        if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
            throw new Error('Risk action description is required');
        }
        const riskId = data.riskId || data.risk?.connect?.id;
        if (!riskId) {
            throw new Error('Risk ID is required');
        }
        const payload = {
            ...data,
            id: data.id || `ra${Date.now()}`,
            risk: { connect: { id: riskId } },
            status: data.status || 'Pending',
            dueDate: data.dueDate && typeof data.dueDate === 'string' ? new Date(data.dueDate) : data.dueDate,
        };
        const ownerId = data.ownerId;
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
    async updateRiskAction(id, data) {
        await this.getRiskActionById(id);
        const updatePayload = { ...data };
        if (data.ownerId) {
            updatePayload.owner = { connect: { id: data.ownerId } };
            delete updatePayload.ownerId;
        }
        if (data.riskId) {
            updatePayload.risk = { connect: { id: data.riskId } };
            delete updatePayload.riskId;
        }
        if (data.dueDate && typeof data.dueDate === 'string') {
            updatePayload.dueDate = new Date(data.dueDate);
        }
        const updatedAction = await this.riskActionRepository.update(id, updatePayload);
        const risk = await this.riskRepository.findById(updatedAction.riskId);
        const projectId = risk?.projectId;
        if (projectId) {
            await this.projectHistoryService.record(projectId, 'RiskAction', updatedAction.id, 'Updated', { riskAction: updatedAction });
        }
        return updatedAction;
    }
    async deleteRiskAction(id) {
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
