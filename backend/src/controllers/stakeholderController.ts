import { Request, Response } from 'express';
import { StakeholderService } from '../services/stakeholderService.js';
import { Prisma } from '../../.prisma/client';

export class StakeholderController {
  private stakeholderService: StakeholderService;

  constructor() {
    this.stakeholderService = new StakeholderService();
  }

  async getAllStakeholders(req: Request, res: Response) {
    try {
      const stakeholders = await this.stakeholderService.getAllStakeholders();
      res.json(stakeholders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stakeholders' });
    }
  }

  async getStakeholderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stakeholder = await this.stakeholderService.getStakeholderById(id);
      res.json(stakeholder);
    } catch (error) {
      if (error instanceof Error && error.message === 'Stakeholder not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch stakeholder' });
      }
    }
  }

  async getStakeholdersByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const stakeholders = await this.stakeholderService.getStakeholdersByProject(projectId);
      res.json(stakeholders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stakeholders by project' });
    }
  }

  async createStakeholder(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      
      // Sponsors cannot create stakeholders
      if (userRole === 'Sponsor') {
        return res.status(403).json({ error: 'Sponsors cannot create stakeholders' });
      }
      
      const data = req.body;
      const stakeholder = await this.stakeholderService.createStakeholder(data);
      res.status(201).json(stakeholder);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create stakeholder' });
      }
    }
  }

  async updateStakeholder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const stakeholder = await this.stakeholderService.updateStakeholder(id, data);
      res.json(stakeholder);
    } catch (error) {
      if (error instanceof Error && error.message === 'Stakeholder not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update stakeholder' });
      }
    }
  }

  async deleteStakeholder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.stakeholderService.deleteStakeholder(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Stakeholder not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete stakeholder' });
      }
    }
  }
}
