import { IssueRepository } from '../repositories/issueRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
export class IssueService {
    issueRepository;
    projectHistoryService;
    constructor() {
        this.issueRepository = new IssueRepository();
        this.projectHistoryService = new ProjectHistoryService();
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
        const createdIssue = await this.issueRepository.create(payload);
        await this.projectHistoryService.record(projectId, 'Issue', createdIssue.id, 'Created', { issue: createdIssue }, data.createdBy || null);
        return createdIssue;
    }
    async updateIssue(id, data) {
        // Validate the issue exists
        await this.getIssueById(id);
        const updatedIssue = await this.issueRepository.update(id, data);
        await this.projectHistoryService.record(updatedIssue.projectId || null, 'Issue', id, 'Updated', { updates: data }, data.updatedBy || null);
        return updatedIssue;
    }
    async deleteIssue(id) {
        // Validate the issue exists
        const issueToDelete = await this.getIssueById(id);
        const deletedIssue = await this.issueRepository.delete(id);
        await this.projectHistoryService.record(issueToDelete.projectId || null, 'Issue', id, 'Deleted', { issue: issueToDelete });
        return deletedIssue;
    }
}
