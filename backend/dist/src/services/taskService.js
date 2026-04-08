import { TaskRepository } from '../repositories/taskRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
export class TaskService {
    taskRepository;
    projectHistoryService;
    constructor() {
        this.taskRepository = new TaskRepository();
        this.projectHistoryService = new ProjectHistoryService();
    }
    async getAllTasks() {
        return await this.taskRepository.findAll();
    }
    async getTaskById(id) {
        const task = await this.taskRepository.findById(id);
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }
    async getTasksByMilestone(milestoneId) {
        return await this.taskRepository.findByMilestone(milestoneId);
    }
    async getTasksByRiskAction(riskActionId) {
        return await this.taskRepository.findByRiskAction(riskActionId);
    }
    normalizeTaskStatus(status) {
        if (!status)
            return undefined;
        const map = {
            'Pending': 'Pending',
            'In Progress': 'In_Progress',
            'In_Progress': 'In_Progress',
            'Blocked': 'Blocked',
            'Completed': 'Completed'
        };
        return map[status] ?? status;
    }
    async createTask(data) {
        // Business logic validation
        if (!data.name || (typeof data.name === 'string' && data.name.trim().length === 0)) {
            throw new Error('Task name is required');
        }
        const milestoneId = data.milestoneId || data.milestone?.connect?.id;
        const riskActionId = data.riskActionId || data.riskAction?.connect?.id;
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
        const payload = {
            ...data,
            id: data.id || `t${Date.now()}`,
            startDate,
            endDate,
            weight: data.weight || 0
        };
        if (milestoneId) {
            payload.milestone = { connect: { id: milestoneId } };
        }
        else if (riskActionId) {
            payload.riskAction = { connect: { id: riskActionId } };
        }
        // Validar que el peso sea válido
        const taskWeight = data.weight || 0;
        if (taskWeight < 0 || taskWeight > 100) {
            throw new Error('Task weight must be between 0 and 100');
        }
        delete payload.milestoneId;
        delete payload.riskActionId;
        if (data.assignedTo) {
            payload.assignedUser = { connect: { id: data.assignedTo } };
        }
        if (data.status) {
            const normalized = this.normalizeTaskStatus(data.status);
            if (normalized)
                payload.status = normalized;
        }
        delete payload.assignedTo;
        if (data.predecessorId) {
            payload.predecessor = { connect: { id: data.predecessorId } };
        }
        delete payload.predecessorId;
        const createdTask = await this.taskRepository.create(payload);
        const projectId = createdTask.milestone?.projectId || createdTask.riskAction?.risk?.projectId || null;
        await this.projectHistoryService.record(projectId, 'Task', createdTask.id, 'Created', { task: createdTask });
        return createdTask;
    }
    async updateTask(id, data) {
        // Validate the task exists
        await this.getTaskById(id);
        // Business logic validation
        if (data.startDate && data.endDate && data.startDate > data.endDate) {
            throw new Error('Start date cannot be after end date');
        }
        const payload = { ...data };
        if (payload.status) {
            payload.status = this.normalizeTaskStatus(payload.status);
        }
        const updatedTask = await this.taskRepository.update(id, payload);
        const projectId = updatedTask.milestone?.projectId || updatedTask.riskAction?.risk?.projectId || null;
        await this.projectHistoryService.record(projectId, 'Task', updatedTask.id, 'Updated', { updates: data, task: updatedTask });
        return updatedTask;
    }
    async deleteTask(id) {
        // Validate the task exists
        const taskToDelete = await this.getTaskById(id);
        const deletedTask = await this.taskRepository.delete(id);
        const projectId = taskToDelete.milestone?.projectId || taskToDelete.riskAction?.risk?.projectId || null;
        await this.projectHistoryService.record(projectId, 'Task', taskToDelete.id, 'Deleted', { task: taskToDelete });
        return deletedTask;
    }
    async calculateMilestoneProgress(milestoneId) {
        const tasks = await this.getTasksByMilestone(milestoneId);
        if (tasks.length === 0)
            return 0;
        const totalWeight = tasks.reduce((sum, t) => sum + (t.weight || 0), 0);
        if (totalWeight === 0)
            return 0;
        const weightedProgress = tasks.reduce((sum, t) => {
            const taskWeight = t.weight || 0;
            const taskProgress = t.progress || 0;
            return sum + (taskProgress * taskWeight / 100);
        }, 0);
        return Math.round(weightedProgress / totalWeight * 100);
    }
}
