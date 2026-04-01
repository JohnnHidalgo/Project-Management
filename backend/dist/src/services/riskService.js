import { RiskRepository } from '../repositories/riskRepository.js';
export class RiskService {
    riskRepository;
    constructor() {
        this.riskRepository = new RiskRepository();
    }
    async getAllRisks() {
        return await this.riskRepository.findAll();
    }
    async getRiskById(id) {
        const risk = await this.riskRepository.findById(id);
        if (!risk) {
            throw new Error('Risk not found');
        }
        return risk;
    }
    async getRisksByProject(projectId) {
        return await this.riskRepository.findByProject(projectId);
    }
    async createRisk(data) {
        // Business logic validation
        if (!data.description || (typeof data.description === 'string' && data.description.trim().length === 0)) {
            throw new Error('Risk description is required');
        }
        const projectId = data.projectId || data.project?.connect?.id;
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        const probability = typeof data.probability === 'number' ? data.probability : undefined;
        if (probability !== undefined && (probability < 0 || probability > 1)) {
            throw new Error('Probability must be between 0 and 1');
        }
        const impact = typeof data.impact === 'number' ? data.impact : undefined;
        if (impact !== undefined && (impact < 0 || impact > 1)) {
            throw new Error('Impact must be between 0 and 1');
        }
        const payload = {
            ...data,
            id: data.id || `r${Date.now()}`,
            project: { connect: { id: projectId } },
        };
        delete payload.projectId;
        return await this.riskRepository.create(payload);
    }
    async updateRisk(id, data) {
        // Validate the risk exists
        await this.getRiskById(id);
        // Business logic validation
        const probabilityValue = typeof data.probability === 'number' ? data.probability : undefined;
        if (probabilityValue !== undefined && (probabilityValue < 0 || probabilityValue > 1)) {
            throw new Error('Probability must be between 0 and 1');
        }
        const impactValue = typeof data.impact === 'number' ? data.impact : undefined;
        if (impactValue !== undefined && (impactValue < 0 || impactValue > 1)) {
            throw new Error('Impact must be between 0 and 1');
        }
        return await this.riskRepository.update(id, data);
    }
    async deleteRisk(id) {
        // Validate the risk exists
        await this.getRiskById(id);
        return await this.riskRepository.delete(id);
    }
}
