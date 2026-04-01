import { StakeholderRepository } from '../repositories/stakeholderRepository.js';
export class StakeholderService {
    stakeholderRepository;
    constructor() {
        this.stakeholderRepository = new StakeholderRepository();
    }
    async getAllStakeholders() {
        return await this.stakeholderRepository.findAll();
    }
    async getStakeholderById(id) {
        const stakeholder = await this.stakeholderRepository.findById(id);
        if (!stakeholder) {
            throw new Error('Stakeholder not found');
        }
        return stakeholder;
    }
    async getStakeholdersByProject(projectId) {
        return await this.stakeholderRepository.findByProject(projectId);
    }
    async createStakeholder(data) {
        // Business logic validation
        const projectId = data.projectId || data.project?.connect?.id;
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        const userId = data.userId || data.user?.connect?.id;
        if (!userId) {
            throw new Error('User ID is required');
        }
        if (!data.influenceStrategy || (typeof data.influenceStrategy === 'string' && data.influenceStrategy.trim().length === 0)) {
            throw new Error('Influence strategy is required');
        }
        const payload = {
            ...data,
            id: data.id || `s${Date.now()}`,
            project: { connect: { id: projectId } },
            user: { connect: { id: userId } },
        };
        delete payload.projectId;
        delete payload.userId;
        return await this.stakeholderRepository.create(payload);
    }
    async updateStakeholder(id, data) {
        // Validate the stakeholder exists
        await this.getStakeholderById(id);
        return await this.stakeholderRepository.update(id, data);
    }
    async deleteStakeholder(id) {
        // Validate the stakeholder exists
        await this.getStakeholderById(id);
        return await this.stakeholderRepository.delete(id);
    }
}
