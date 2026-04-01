import { Request, Response } from 'express';
import { IssueService } from '../services/issueService.js';
import { Prisma } from '../../.prisma/client';

export class IssueController {
  private issueService: IssueService;

  constructor() {
    this.issueService = new IssueService();
  }

  async getAllIssues(req: Request, res: Response) {
    try {
      const issues = await this.issueService.getAllIssues();
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch issues' });
    }
  }

  async getIssueById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const issue = await this.issueService.getIssueById(id);
      res.json(issue);
    } catch (error) {
      if (error instanceof Error && error.message === 'Issue not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch issue' });
      }
    }
  }

  async getIssuesByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const issues = await this.issueService.getIssuesByProject(projectId);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch issues by project' });
    }
  }

  async createIssue(req: Request, res: Response) {
    try {
      const data = req.body;
      const issue = await this.issueService.createIssue(data);
      res.status(201).json(issue);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create issue' });
      }
    }
  }

  async updateIssue(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const issue = await this.issueService.updateIssue(id, data);
      res.json(issue);
    } catch (error) {
      if (error instanceof Error && error.message === 'Issue not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update issue' });
      }
    }
  }

  async deleteIssue(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.issueService.deleteIssue(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Issue not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete issue' });
      }
    }
  }
}