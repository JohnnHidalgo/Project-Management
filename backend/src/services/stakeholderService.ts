import { StakeholderRepository } from '../repositories/stakeholderRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Prisma } from '../../dist/.prisma/client';

export class StakeholderService {
  private stakeholderRepository: StakeholderRepository;
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.stakeholderRepository = new StakeholderRepository();
    this.projectHistoryService = new ProjectHistoryService();
  }

  async getAllStakeholders() {
    return await this.stakeholderRepository.findAll();
  }

  async getStakeholderById(id: string) {
    const stakeholder = await this.stakeholderRepository.findById(id);
    if (!stakeholder) {
      throw new Error('Stakeholder not found');
    }
    return stakeholder;
  }

  async getStakeholdersByProject(projectId: string) {
    return await this.stakeholderRepository.findByProject(projectId);
  }

  async createStakeholder(data: Prisma.StakeholderCreateInput) {
    // Business logic validation
    const projectId = (data as any).projectId || (data as any).project?.connect?.id;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const userId = (data as any).userId || (data as any).user?.connect?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!data.influenceStrategy || (typeof data.influenceStrategy === 'string' && data.influenceStrategy.trim().length === 0)) {
      throw new Error('Influence strategy is required');
    }

    const payload: any = {
      ...data,
      id: (data as any).id || `s${Date.now()}`,
      project: { connect: { id: projectId } },
      user: { connect: { id: userId } },
    };

    delete payload.projectId;
    delete payload.userId;

    const createdStakeholder = await this.stakeholderRepository.create(payload);

    await this.projectHistoryService.record(
      createdStakeholder.projectId,
      'Stakeholder',
      createdStakeholder.id,
      'Created',
      { stakeholder: createdStakeholder }
    );

    return createdStakeholder;
  }

  async updateStakeholder(id: string, data: Prisma.StakeholderUpdateInput) {
    // Validate the stakeholder exists
    await this.getStakeholderById(id);

    return await this.stakeholderRepository.update(id, data);
  }

  async deleteStakeholder(id: string) {
    // Validate the stakeholder exists
    const stakeholderToDelete = await this.getStakeholderById(id);

    const deletedStakeholder = await this.stakeholderRepository.delete(id);

    await this.projectHistoryService.record(
      stakeholderToDelete.projectId,
      'Stakeholder',
      stakeholderToDelete.id,
      'Deleted',
      { stakeholder: stakeholderToDelete }
    );

    return deletedStakeholder;
  }
}
