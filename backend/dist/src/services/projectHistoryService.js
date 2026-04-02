import { ProjectHistoryRepository } from '../repositories/projectHistoryRepository.js';
export class ProjectHistoryService {
    projectHistoryRepository;
    constructor() {
        this.projectHistoryRepository = new ProjectHistoryRepository();
    }
    async getAllProjectHistories() {
        return this.projectHistoryRepository.findAll();
    }
    async getProjectHistoryByProject(projectId) {
        return this.projectHistoryRepository.findByProject(projectId);
    }
    async record(projectId, entity, entityId, action, details, userId) {
        const payload = {
            id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            projectId: projectId || undefined,
            entity,
            entityId: entityId || undefined,
            action,
            details: details ? details : undefined,
            userId: userId || undefined,
            createdAt: new Date()
        };
        return this.projectHistoryRepository.create(payload);
    }
}
