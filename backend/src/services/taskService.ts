import { TaskRepository } from '../repositories/taskRepository';
import { Prisma } from '../../.prisma/client';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
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
    if (!milestoneId) {
      throw new Error('Milestone ID is required');
    }

    const startDate = data.startDate && typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
    const endDate = data.endDate && typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;

    if (startDate && endDate && startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }

    const payload: any = {
      ...data,
      id: (data as any).id || `t${Date.now()}`,
      milestone: { connect: { id: milestoneId } },
      startDate,
      endDate,
    };

    delete payload.milestoneId;

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

    return await this.taskRepository.create(payload);
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

    return await this.taskRepository.update(id, payload);
  }

  async deleteTask(id: string) {
    // Validate the task exists
    await this.getTaskById(id);

    return await this.taskRepository.delete(id);
  }
}