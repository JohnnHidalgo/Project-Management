import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService.js';
import { ProjectStatus } from '../../.prisma/client';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await this.projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      res.json(project);
    } catch (error) {
      if (error instanceof Error && error.message === 'Project not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch project' });
      }
    }
  }

  async createProject(req: Request, res: Response) {
    try {
      const data = req.body;
      const project = await this.projectService.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create project' });
      }
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      const project = await this.projectService.updateProject(id, data, userId, userRole);
      res.json(project);
    } catch (error) {
      if (error instanceof Error && error.message === 'Project not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update project' });
      }
    }
  }

  async togglePmCanEdit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { pmCanEdit } = req.body;
      const userRole = (req as any).user?.role;

      // Only PMO can change pmCanEdit
      if (userRole !== 'PMO') {
        return res.status(403).json({ error: 'Only PMO can change project edit permissions' });
      }

      const project = await this.projectService.togglePmCanEdit(id, pmCanEdit);
      res.json(project);
    } catch (error) {
      if (error instanceof Error && error.message === 'Project not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update project permissions' });
      }
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.projectService.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Project not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete project' });
      }
    }
  }
}