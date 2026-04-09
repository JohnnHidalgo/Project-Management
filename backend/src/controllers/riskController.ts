import { Request, Response } from 'express';
import { RiskService } from '../services/riskService.js';
import { Prisma } from '../../.prisma/client';

export class RiskController {
  private riskService: RiskService;

  constructor() {
    this.riskService = new RiskService();
  }

  async getAllRisks(req: Request, res: Response) {
    try {
      const risks = await this.riskService.getAllRisks();
      res.json(risks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch risks' });
    }
  }

  async getRiskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const risk = await this.riskService.getRiskById(id);
      res.json(risk);
    } catch (error) {
      if (error instanceof Error && error.message === 'Risk not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch risk' });
      }
    }
  }

  async getRisksByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const risks = await this.riskService.getRisksByProject(projectId);
      res.json(risks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch risks by project' });
    }
  }

  async createRisk(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      
      // Sponsors cannot create risks
      if (userRole === 'Sponsor') {
        return res.status(403).json({ error: 'Sponsors cannot create risks' });
      }
      
      const data = req.body;
      const risk = await this.riskService.createRisk(data);
      res.status(201).json(risk);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create risk' });
      }
    }
  }

  async updateRisk(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const risk = await this.riskService.updateRisk(id, data);
      res.json(risk);
    } catch (error) {
      if (error instanceof Error && error.message === 'Risk not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update risk' });
      }
    }
  }

  async deleteRisk(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.riskService.deleteRisk(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Risk not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete risk' });
      }
    }
  }
}