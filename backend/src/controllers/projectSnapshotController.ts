import { Request, Response } from 'express';
import { ProjectSnapshotService } from '../services/projectSnapshotService.js';

export class ProjectSnapshotController {
  private snapshotService: ProjectSnapshotService;

  constructor() {
    this.snapshotService = new ProjectSnapshotService();
  }

  async getAllSnapshots(req: Request, res: Response) {
    try {
      const snapshots = await this.snapshotService.getAllSnapshots();
      res.json(snapshots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch snapshots' });
    }
  }

  async getSnapshotById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const snapshot = await this.snapshotService.getSnapshotById(id);
      res.json(snapshot);
    } catch (error) {
      if (error instanceof Error && error.message === 'Snapshot not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch snapshot' });
      }
    }
  }

  async getSnapshotsByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const snapshots = await this.snapshotService.getSnapshotsByProject(projectId);
      res.json(snapshots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch snapshots by project' });
    }
  }

  async createSnapshot(req: Request, res: Response) {
    try {
      const data = req.body;
      const snapshot = await this.snapshotService.createSnapshot(data);
      res.status(201).json(snapshot);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create snapshot' });
      }
    }
  }
}
