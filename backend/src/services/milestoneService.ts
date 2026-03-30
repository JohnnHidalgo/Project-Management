import { MilestoneRepository } from '../repositories/milestoneRepository';
import { Prisma } from '../../.prisma/client';

export class MilestoneService {
  private milestoneRepository: MilestoneRepository;

  constructor() {
    this.milestoneRepository = new MilestoneRepository();
  }

  async getAllMilestones() {
    return await this.milestoneRepository.findAll();
  }

  async getMilestoneById(id: string) {
    const milestone = await this.milestoneRepository.findById(id);
    if (!milestone) {
      throw new Error('Milestone not found');
    }
    return milestone;
  }

  async getMilestonesByProject(projectId: string) {
    return await this.milestoneRepository.findByProject(projectId);
  }

  async createMilestone(data: Prisma.MilestoneCreateInput) {
    // Business logic validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Milestone name is required');
    }

    if (!data.projectId) {
      throw new Error('Project ID is required');
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    return await this.milestoneRepository.create(data);
  }

  async updateMilestone(id: string, data: Prisma.MilestoneUpdateInput) {
    // Validate the milestone exists
    await this.getMilestoneById(id);

    // Business logic validation
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    return await this.milestoneRepository.update(id, data);
  }

  async deleteMilestone(id: string) {
    // Validate the milestone exists
    await this.getMilestoneById(id);

    return await this.milestoneRepository.delete(id);
  }
}