import { Request, Response } from 'express';
import { RiskActionService } from '../services/riskActionService.js';

export class RiskActionController {
  private riskActionService: RiskActionService;

  constructor() {
    this.riskActionService = new RiskActionService();
  }

  async getAllRiskActions(req: Request, res: Response) {
    try {
      const actions = await this.riskActionService.getAllRiskActions();
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch risk actions' });
    }
  }

  async getRiskActionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const action = await this.riskActionService.getRiskActionById(id);
      res.json(action);
    } catch (error) {
      if (error instanceof Error && error.message === 'Risk action not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch risk action' });
      }
    }
  }

  async getRiskActionsByRisk(req: Request, res: Response) {
    try {
      const { riskId } = req.params;
      const actions = await this.riskActionService.getRiskActionsByRisk(riskId);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch risk actions by risk' });
    }
  }

  async createRiskAction(req: Request, res: Response) {
    try {
      const data = req.body;
      const action = await this.riskActionService.createRiskAction(data);
      res.status(201).json(action);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create risk action' });
      }
    }
  }

  async updateRiskAction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const action = await this.riskActionService.updateRiskAction(id, data);
      res.json(action);
    } catch (error) {
      if (error instanceof Error && error.message === 'Risk action not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update risk action' });
      }
    }
  }

  async deleteRiskAction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.riskActionService.deleteRiskAction(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Risk action not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete risk action' });
      }
    }
  }
}
