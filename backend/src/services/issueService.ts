import { IssueRepository } from '../repositories/issueRepository';
import { Prisma } from '../../.prisma/client';

export class IssueService {
  private issueRepository: IssueRepository;

  constructor() {
    this.issueRepository = new IssueRepository();
  }

  async getAllIssues() {
    return await this.issueRepository.findAll();
  }

  async getIssueById(id: string) {
    const issue = await this.issueRepository.findById(id);
    if (!issue) {
      throw new Error('Issue not found');
    }
    return issue;
  }

  async getIssuesByProject(projectId: string) {
    return await this.issueRepository.findByProject(projectId);
  }

  async createIssue(data: Prisma.IssueCreateInput) {
    // Business logic validation
    if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
      throw new Error('Issue description is required');
    }

    const projectId = (data as any).projectId || (data as any).project?.connect?.id;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const payload: any = {
      ...data,
      id: (data as any).id || `i${Date.now()}`,
      project: { connect: { id: projectId } },
    };

    delete payload.projectId;

    return await this.issueRepository.create(payload);
  }

  async updateIssue(id: string, data: Prisma.IssueUpdateInput) {
    // Validate the issue exists
    await this.getIssueById(id);

    return await this.issueRepository.update(id, data);
  }

  async deleteIssue(id: string) {
    // Validate the issue exists
    await this.getIssueById(id);

    return await this.issueRepository.delete(id);
  }
}