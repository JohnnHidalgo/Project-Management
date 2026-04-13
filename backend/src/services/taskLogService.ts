import { TaskLogRepository } from '../repositories/taskLogRepository.js';
import { TaskRepository } from '../repositories/taskRepository.js';
import { TaskService } from './taskService.js';
import { MilestoneService } from './milestoneService.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Prisma } from '../../.prisma/client';

export class TaskLogService {
  private taskLogRepository: TaskLogRepository;
  private taskRepository: TaskRepository;
  private taskService: TaskService;
  private milestoneService: MilestoneService;
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.taskLogRepository = new TaskLogRepository();
    this.taskRepository = new TaskRepository();
    this.taskService = new TaskService();
    this.milestoneService = new MilestoneService();
    this.projectHistoryService = new ProjectHistoryService();
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

      // Recalcular el progreso del milestone después de actualizar la tarea
      const task = await this.taskRepository.findById(taskId);
      if (task && task.milestoneId) {
        const newMilestoneProgress = await this.taskService.calculateMilestoneProgress(task.milestoneId);
        await this.milestoneService.updateMilestone(task.milestoneId, {
          progress: newMilestoneProgress
        });
      }
    }

    const task = await this.taskRepository.findById(taskId);
    const projectId = task?.milestone?.projectId ?? null;
    await this.projectHistoryService.record(projectId, 'TaskLog', createdLog.id, 'Created', { taskLog: createdLog }, (data as any).userId || null);

    return createdLog;
  }

  async updateTaskLog(id: string, data: Prisma.TaskLogUpdateInput) {
    // Validate the task log exists
    const existingLog = await this.getTaskLogById(id);

    const updatedLog = await this.taskLogRepository.update(id, data);
    const task = await this.taskRepository.findById(existingLog.taskId);
    const projectId = task?.milestone?.projectId ?? null;
    await this.projectHistoryService.record(projectId, 'TaskLog', id, 'Updated', { updates: data }, (data as any).userId || null);
    return updatedLog;
  }

  async deleteTaskLog(id: string) {
    // Validate the task log exists
    const existingLog = await this.getTaskLogById(id);

    const deletedLog = await this.taskLogRepository.delete(id);
    const task = await this.taskRepository.findById(existingLog.taskId);
    const projectId = task?.milestone?.projectId ?? null;
    await this.projectHistoryService.record(projectId, 'TaskLog', id, 'Deleted', { taskLog: existingLog });
    return deletedLog;
  }
}
