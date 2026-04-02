import { Request, Response } from 'express';
import { ChangeRequestService } from '../services/changeRequestService.js';

export class ChangeRequestController {
  private changeRequestService: ChangeRequestService;

  constructor() {
    this.changeRequestService = new ChangeRequestService();
  }

  async getAllChangeRequests(req: Request, res: Response) {
    try {
      const changeRequests = await this.changeRequestService.getAllChangeRequests();
      res.json(changeRequests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch change requests' });
    }
  }

  async getChangeRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const changeRequest = await this.changeRequestService.getChangeRequestById(id);
      res.json(changeRequest);
    } catch (error) {
      if (error instanceof Error && error.message === 'Change request not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch change request' });
      }
    }
  }

  async getChangeRequestsByTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const changeRequests = await this.changeRequestService.getChangeRequestsByTask(taskId);
      res.json(changeRequests);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch change requests by task' });
    }
  }

  async createChangeRequest(req: Request, res: Response) {
    try {
      const data = req.body;
      const changeRequest = await this.changeRequestService.createChangeRequest(data);
      res.status(201).json(changeRequest);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create change request' });
      }
    }
  }

  async updateChangeRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const changeRequest = await this.changeRequestService.updateChangeRequest(id, data);
      res.json(changeRequest);
    } catch (error) {
      if (error instanceof Error && error.message === 'Change request not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update change request' });
      }
    }
  }

  async deleteChangeRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.changeRequestService.deleteChangeRequest(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Change request not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete change request' });
      }
    }
  }

  async processChangeRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Valid status (Approved or Rejected) is required' });
      }

      const changeRequest = await this.changeRequestService.processChangeRequest(id, status);
      res.json(changeRequest);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to process change request' });
      }
    }
  }
}