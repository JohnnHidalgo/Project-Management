import { ProjectSnapshotRepository } from '../repositories/projectSnapshotRepository.js';
export class ProjectSnapshotService {
    repository;
    constructor() {
        this.repository = new ProjectSnapshotRepository();
    }
    async getAllSnapshots() {
        return await this.repository.findAll();
    }
    async getSnapshotsByProject(projectId) {
        if (!projectId) {
            throw new Error('projectId is required');
        }
        return await this.repository.findByProject(projectId);
    }
    async getSnapshotById(id) {
        const snapshot = await this.repository.findById(id);
        if (!snapshot) {
            throw new Error('Snapshot not found');
        }
        return snapshot;
    }
    async createSnapshot(data) {
        const projectId = data.projectId;
        if (!projectId) {
            throw new Error('projectId is required');
        }
        const payload = {
            ...data,
            id: data.id || `snap-${Date.now()}`,
            date: typeof data.date === 'string' ? new Date(data.date) : data.date,
            project: {
                connect: {
                    id: projectId
                }
            }
        };
        delete payload.projectId;
        return await this.repository.create(payload);
    }
}
