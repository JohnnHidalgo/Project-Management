import { TaskLogRepository } from '../repositories/taskLogRepository';
import { TaskRepository } from '../repositories/taskRepository';
import { Prisma } from '../../.prisma/client';

export class TaskLogService {
  private taskLogRepository: TaskLogRepository;
  private taskRepository: TaskRepository;

  constructor() {
    this.taskLogRepository = new TaskLogRepository();
    this.taskRepository = new TaskRepository();
  }

  async getAllTaskLogs() {
    return await this.taskLogRepository.findAll();
  }

  async getTaskLogById(id: string) {
    const taskLog = await this.taskLogRepository.findById(id);
    if (!taskLog) {
      throw new Error('Task log not found');
    }
    return taskLog;
  }

  async getTaskLogsByTask(taskId: string) {
    return await this.taskLogRepository.findByTask(taskId);
  }

  async createTaskLog(data: Prisma.TaskLogCreateInput) {
    // Business logic validation
    const taskId = (data as any).taskId;
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const userId = (data as any).userId;
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!data.comment || (typeof data.comment === 'string' && data.comment.trim().length === 0)) {
      throw new Error('Comment is required');
    }

    const newProgress = (data as any).newProgress;
    if (newProgress !== undefined && (newProgress < 0 || newProgress > 100)) {
      throw new Error('Progress must be between 0 and 100');
    }

    const payload: any = {
      ...data,
      id: (data as any).id || `log${Date.now()}`,
      date: data.date ? new Date(data.date) : new Date(),
      task: { connect: { id: taskId } },
      user: { connect: { id: userId } },
    };

    delete payload.taskId;
    delete payload.userId;

    const createdLog = await this.taskLogRepository.create(payload);

    // Sincronizar el progreso de la tarea tras registrar el log
    if (newProgress !== undefined && newProgress !== null) {
      const taskStatus = newProgress >= 100 ? 'Completed' : 'In_Progress';
      await this.taskRepository.update(taskId, {
        progress: newProgress,
        status: taskStatus as any
      });
    }

    return createdLog;
  }

  async updateTaskLog(id: string, data: Prisma.TaskLogUpdateInput) {
    // Validate the task log exists
    await this.getTaskLogById(id);

    return await this.taskLogRepository.update(id, data);
  }

  async deleteTaskLog(id: string) {
    // Validate the task log exists
    await this.getTaskLogById(id);

    return await this.taskLogRepository.delete(id);
  }
}