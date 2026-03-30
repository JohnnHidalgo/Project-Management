import { RiskRepository } from '../repositories/riskRepository';
import { Prisma } from '../../.prisma/client';

export class RiskService {
  private riskRepository: RiskRepository;

  constructor() {
    this.riskRepository = new RiskRepository();
  }

  async getAllRisks() {
    return await this.riskRepository.findAll();
  }

  async getRiskById(id: string) {
    const risk = await this.riskRepository.findById(id);
    if (!risk) {
      throw new Error('Risk not found');
    }
    return risk;
  }

  async getRisksByProject(projectId: string) {
    return await this.riskRepository.findByProject(projectId);
  }

  async createRisk(data: Prisma.RiskCreateInput) {
    // Business logic validation
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Risk description is required');
    }

    if (!data.projectId) {
      throw new Error('Project ID is required');
    }

    if (data.probability < 0 || data.probability > 1) {
      throw new Error('Probability must be between 0 and 1');
    }

    if (data.impact < 0 || data.impact > 1) {
      throw new Error('Impact must be between 0 and 1');
    }

    return await this.riskRepository.create(data);
  }

  async updateRisk(id: string, data: Prisma.RiskUpdateInput) {
    // Validate the risk exists
    await this.getRiskById(id);

    // Business logic validation
    if (data.probability !== undefined && (data.probability < 0 || data.probability > 1)) {
      throw new Error('Probability must be between 0 and 1');
    }

    if (data.impact !== undefined && (data.impact < 0 || data.impact > 1)) {
      throw new Error('Impact must be between 0 and 1');
    }

    return await this.riskRepository.update(id, data);
  }

  async deleteRisk(id: string) {
    // Validate the risk exists
    await this.getRiskById(id);

    return await this.riskRepository.delete(id);
  }
}