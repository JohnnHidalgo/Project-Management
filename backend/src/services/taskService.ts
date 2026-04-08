import { TaskRepository } from '../repositories/taskRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Prisma } from '../../.prisma/client';

export class TaskService {
  private taskRepository: TaskRepository;
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectHistoryService = new ProjectHistoryService();
  }

  async getAllTasks() {
    return await this.taskRepository.findAll();
  }

  async getTaskById(id: string) {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  async getTasksByMilestone(milestoneId: string) {
    return await this.taskRepository.findByMilestone(milestoneId);
  }

  async getTasksByRiskAction(riskActionId: string) {
    return await this.taskRepository.findByRiskAction(riskActionId);
  }

  private normalizeTaskStatus(status?: string): string | undefined {
    if (!status) return undefined;
    const map: Record<string, string> = {
      'Pending': 'Pending',
      'In Progress': 'In_Progress',
      'In_Progress': 'In_Progress',
      'Blocked': 'Blocked',
      'Completed': 'Completed'
    };
    return map[status] ?? status;
  }

  async createTask(data: Prisma.TaskCreateInput) {
    // Business logic validation
    if (!data.name || (typeof data.name === 'string' && data.name.trim().length === 0)) {
      throw new Error('Task name is required');
    }

    const milestoneId = (data as any).milestoneId || (data as any).milestone?.connect?.id;
    const riskActionId = (data as any).riskActionId || (data as any).riskAction?.connect?.id;

    if (!milestoneId && !riskActionId) {
      throw new Error('Either Milestone ID or Risk Action ID is required');
    }

    if (milestoneId && riskActionId) {
      throw new Error('Task cannot belong to both a milestone and a risk action');
    }

    const startDate = data.startDate && typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
    const endDate = data.endDate && typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;

    if (startDate && endDate && startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }

    const payload: any = {
      ...data,
      id: (data as any).id || `t${Date.now()}`,
      startDate,
      endDate,
      weight: (data as any).weight || 0
    };

    if (milestoneId) {
      payload.milestone = { connect: { id: milestoneId } };
    } else if (riskActionId) {
      payload.riskAction = { connect: { id: riskActionId } };
    }

    // Validar que el peso sea válido
    const taskWeight = (data as any).weight || 0;
    if (taskWeight < 0 || taskWeight > 100) {
      throw new Error('Task weight must be between 0 and 100');
    }

    delete payload.milestoneId;
    delete payload.riskActionId;

    if ((data as any).assignedTo) {
      payload.assignedUser = { connect: { id: (data as any).assignedTo } };
    }

    if ((data as any).status) {
      const normalized = this.normalizeTaskStatus((data as any).status);
      if (normalized) payload.status = normalized;
    }
    delete payload.assignedTo;

    if ((data as any).predecessorId) {
      payload.predecessor = { connect: { id: (data as any).predecessorId } };
    }
    delete payload.predecessorId;

    const createdTask = await this.taskRepository.create(payload);

    const projectId = createdTask.milestone?.projectId || createdTask.riskAction?.risk?.projectId || null;

    await this.projectHistoryService.record(
      projectId,
      'Task',
      createdTask.id,
      'Created',
      { task: createdTask }
    );

    return createdTask;
  }

  async updateTask(id: string, data: Prisma.TaskUpdateInput) {
    // Validate the task exists
    await this.getTaskById(id);

    // Business logic validation
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    const payload = { ...data } as any;
    if (payload.status) {
      payload.status = this.normalizeTaskStatus(payload.status);
    }

    const updatedTask = await this.taskRepository.update(id, payload);

    const projectId = updatedTask.milestone?.projectId || updatedTask.riskAction?.risk?.projectId || null;
    await this.projectHistoryService.record(
      projectId,
      'Task',
      updatedTask.id,
      'Updated',
      { updates: data, task: updatedTask }
    );

    return updatedTask;
  }

  async deleteTask(id: string) {
    // Validate the task exists
    const taskToDelete = await this.getTaskById(id);

    const deletedTask = await this.taskRepository.delete(id);

    const projectId = taskToDelete.milestone?.projectId || taskToDelete.riskAction?.risk?.projectId || null;
    await this.projectHistoryService.record(
      projectId,
      'Task',
      taskToDelete.id,
      'Deleted',
      { task: taskToDelete }
    );

    return deletedTask;
  }

  async calculateMilestoneProgress(milestoneId: string): Promise<number> {
    const tasks = await this.getTasksByMilestone(milestoneId);
    
    if (tasks.length === 0) return 0;

    const totalWeight = tasks.reduce((sum, t) => sum + ((t as any).weight || 0), 0);
    
    if (totalWeight === 0) return 0;

    const weightedProgress = tasks.reduce((sum, t) => {
      const taskWeight = (t as any).weight || 0;
      const taskProgress = t.progress || 0;
      return sum + (taskProgress * taskWeight / 100);
    }, 0);

    return Math.round(weightedProgress / totalWeight * 100);
  }
}