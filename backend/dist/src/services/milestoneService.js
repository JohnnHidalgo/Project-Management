import { MilestoneRepository } from '../repositories/milestoneRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
export class MilestoneService {
    milestoneRepository;
    projectHistoryService;
    constructor() {
        this.milestoneRepository = new MilestoneRepository();
        this.projectHistoryService = new ProjectHistoryService();
    }
    async getAllMilestones() {
        return await this.milestoneRepository.findAll();
    }
    async getMilestoneById(id) {
        const milestone = await this.milestoneRepository.findById(id);
        if (!milestone) {
            throw new Error('Milestone not found');
        }
        return milestone;
    }
    async getMilestonesByProject(projectId) {
        return await this.milestoneRepository.findByProject(projectId);
    }
    async createMilestone(data) {
        // Business logic validation
        if (!data.name || (typeof data.name === 'string' && data.name.trim().length === 0)) {
            throw new Error('Milestone name is required');
        }
        const projectId = data.projectId || data.project?.connect?.id;
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        const startDate = data.startDate && typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
        const endDate = data.endDate && typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;
        if (startDate && endDate && startDate > endDate) {
            throw new Error('Start date cannot be after end date');
        }
        const payload = {
            ...data,
            id: data.id || `m${Date.now()}`,
            startDate,
            endDate,
            project: { connect: { id: projectId } },
        };
        delete payload.projectId;
        const createdMilestone = await this.milestoneRepository.create(payload);
        await this.projectHistoryService.record(createdMilestone.projectId, 'Milestone', createdMilestone.id, 'Created', { milestone: createdMilestone });
        return createdMilestone;
    }
    async updateMilestone(id, data) {
        // Validate the milestone exists
        await this.getMilestoneById(id);
        // Business logic validation
        if (data.startDate && data.endDate && data.startDate > data.endDate) {
            throw new Error('Start date cannot be after end date');
        }
        const updatedMilestone = await this.milestoneRepository.update(id, data);
        await this.projectHistoryService.record(updatedMilestone.projectId, 'Milestone', updatedMilestone.id, 'Updated', { updates: data, milestone: updatedMilestone });
        return updatedMilestone;
    }
    async deleteMilestone(id) {
        // Validate the milestone exists
        const milestoneToDelete = await this.getMilestoneById(id);
        const deletedMilestone = await this.milestoneRepository.delete(id);
        await this.projectHistoryService.record(milestoneToDelete.projectId, 'Milestone', milestoneToDelete.id, 'Deleted', { milestone: milestoneToDelete });
        return deletedMilestone;
    }
}
