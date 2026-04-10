import { Request, Response } from 'express';
import { TaskLogService } from '../services/taskLogService.js';
import { Prisma } from '@prisma/client';

export class TaskLogController {
  private taskLogService: TaskLogService;

  constructor() {
    this.taskLogService = new TaskLogService();
  }

  async getAllTaskLogs(req: Request, res: Response) {
    try {
      const taskLogs = await this.taskLogService.getAllTaskLogs();
      res.json(taskLogs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task logs' });
    }
  }

  async getTaskLogById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const taskLog = await this.taskLogService.getTaskLogById(id);
      res.json(taskLog);
    } catch (error) {
      if (error instanceof Error && error.message === 'Task log not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch task log' });
      }
    }
  }

  async getTaskLogsByTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const taskLogs = await this.taskLogService.getTaskLogsByTask(taskId);
      res.json(taskLogs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task logs by task' });
    }
  }

  async createTaskLog(req: Request, res: Response) {
    try {
      const data = req.body;
      const taskLog = await this.taskLogService.createTaskLog(data);
      res.status(201).json(taskLog);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create task log' });
      }
    }
  }

  async updateTaskLog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const taskLog = await this.taskLogService.updateTaskLog(id, data);
      res.json(taskLog);
    } catch (error) {
      if (error instanceof Error && error.message === 'Task log not found') {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update task log' });
      }
    }
  }

  async deleteTaskLog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.taskLogService.deleteTaskLog(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Task log not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete task log' });
      }
    }
  }
}
