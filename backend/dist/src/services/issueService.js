import { IssueRepository } from '../repositories/issueRepository.js';
export class IssueService {
    issueRepository;
    constructor() {
        this.issueRepository = new IssueRepository();
    }
    async getAllIssues() {
        return await this.issueRepository.findAll();
    }
    async getIssueById(id) {
        const issue = await this.issueRepository.findById(id);
        if (!issue) {
            throw new Error('Issue not found');
        }
        return issue;
    }
    async getIssuesByProject(projectId) {
        return await this.issueRepository.findByProject(projectId);
    }
    async createIssue(data) {
        // Business logic validation
        if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
            throw new Error('Issue description is required');
        }
        const projectId = data.projectId || data.project?.connect?.id;
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        const payload = {
            ...data,
            id: data.id || `i${Date.now()}`,
            project: { connect: { id: projectId } },
        };
        delete payload.projectId;
        return await this.issueRepository.create(payload);
    }
    async updateIssue(id, data) {
        // Validate the issue exists
        await this.getIssueById(id);
        return await this.issueRepository.update(id, data);
    }
    async deleteIssue(id) {
        // Validate the issue exists
        await this.getIssueById(id);
        return await this.issueRepository.delete(id);
    }
}
