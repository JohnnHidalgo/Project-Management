import { Request, Response } from 'express';
import { ProjectHistoryService } from '../services/projectHistoryService.js';

export class ProjectHistoryController {
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.projectHistoryService = new ProjectHistoryService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const history = await this.projectHistoryService.getAllProjectHistories();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project history' });
    }
  }

  async getByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const history = await this.projectHistoryService.getProjectHistoryByProject(projectId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch project history by project' });
    }
  }
}
