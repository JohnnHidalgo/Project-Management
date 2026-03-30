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

  async createTask(data: Prisma.TaskCreateInput) {
    // Business logic validation
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Task name is required');
    }

    if (!data.milestoneId) {
      throw new Error('Milestone ID is required');
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    return await this.taskRepository.create(data);
  }

  async updateTask(id: string, data: Prisma.TaskUpdateInput) {
    // Validate the task exists
    await this.getTaskById(id);

    // Business logic validation
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    return await this.taskRepository.update(id, data);
  }

  async deleteTask(id: string) {
    // Validate the task exists
    await this.getTaskById(id);

    return await this.taskRepository.delete(id);
  }
}