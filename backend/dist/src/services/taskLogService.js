import { TaskLogRepository } from '../repositories/taskLogRepository.js';
import { TaskRepository } from '../repositories/taskRepository.js';
import { TaskService } from './taskService.js';
import { MilestoneService } from './milestoneService.js';
export class TaskLogService {
    taskLogRepository;
    taskRepository;
    taskService;
    milestoneService;
    constructor() {
        this.taskLogRepository = new TaskLogRepository();
        this.taskRepository = new TaskRepository();
        this.taskService = new TaskService();
        this.milestoneService = new MilestoneService();
    }
    async getAllTaskLogs() {
        return await this.taskLogRepository.findAll();
    }
    async getTaskLogById(id) {
        const taskLog = await this.taskLogRepository.findById(id);
        if (!taskLog) {
            throw new Error('Task log not found');
        }
        return taskLog;
    }
    async getTaskLogsByTask(taskId) {
        return await this.taskLogRepository.findByTask(taskId);
    }
    async createTaskLog(data) {
        // Business logic validation
        const taskId = data.taskId;
        if (!taskId) {
            throw new Error('Task ID is required');
        }
        const userId = data.userId;
        if (!userId) {
            throw new Error('User ID is required');
        }
        if (!data.comment || (typeof data.comment === 'string' && data.comment.trim().length === 0)) {
            throw new Error('Comment is required');
        }
        const newProgress = data.newProgress;
        if (newProgress !== undefined && (newProgress < 0 || newProgress > 100)) {
            throw new Error('Progress must be between 0 and 100');
        }
        const payload = {
            ...data,
            id: data.id || `log${Date.now()}`,
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
                status: taskStatus
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
        return createdLog;
    }
    async updateTaskLog(id, data) {
        // Validate the task log exists
        await this.getTaskLogById(id);
        return await this.taskLogRepository.update(id, data);
    }
    async deleteTaskLog(id) {
        // Validate the task log exists
        await this.getTaskLogById(id);
        return await this.taskLogRepository.delete(id);
    }
}
