import { StakeholderRepository } from '../repositories/stakeholderRepository';
import { Prisma } from '../../.prisma/client';

export class StakeholderService {
  private stakeholderRepository: StakeholderRepository;

  constructor() {
    this.stakeholderRepository = new StakeholderRepository();
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
    if (!data.projectId) {
      throw new Error('Project ID is required');
    }

    if (!data.userId) {
      throw new Error('User ID is required');
    }

    if (!data.influenceStrategy || data.influenceStrategy.trim().length === 0) {
      throw new Error('Influence strategy is required');
    }

    return await this.stakeholderRepository.create(data);
  }

  async updateStakeholder(id: string, data: Prisma.StakeholderUpdateInput) {
    // Validate the stakeholder exists
    await this.getStakeholderById(id);

    return await this.stakeholderRepository.update(id, data);
  }

  async deleteStakeholder(id: string) {
    // Validate the stakeholder exists
    await this.getStakeholderById(id);

    return await this.stakeholderRepository.delete(id);
  }
}