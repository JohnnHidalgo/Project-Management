import { TaskService } from '../services/taskService.js';
export class TaskController {
    taskService;
    constructor() {
        this.taskService = new TaskService();
    }
    async getAllTasks(req, res) {
        try {
            const tasks = await this.taskService.getAllTasks();
            res.json(tasks);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }
    async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await this.taskService.getTaskById(id);
            res.json(task);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Task not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to fetch task' });
            }
        }
    }
    async getTasksByMilestone(req, res) {
        try {
            const { milestoneId } = req.params;
            const tasks = await this.taskService.getTasksByMilestone(milestoneId);
            res.json(tasks);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch tasks by milestone' });
        }
    }
    async getTasksByRiskAction(req, res) {
        try {
            const { riskActionId } = req.params;
            const tasks = await this.taskService.getTasksByRiskAction(riskActionId);
            res.json(tasks);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch tasks by risk action' });
        }
    }
    async createTask(req, res) {
        try {
            const data = req.body;
            const task = await this.taskService.createTask(data);
            res.status(201).json(task);
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to create task' });
            }
        }
    }
    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const task = await this.taskService.updateTask(id, data);
            res.json(task);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Task not found') {
                res.status(404).json({ error: error.message });
            }
            else if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to update task' });
            }
        }
    }
    async deleteTask(req, res) {
        try {
            const { id } = req.params;
            await this.taskService.deleteTask(id);
            res.status(204).send();
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Task not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Failed to delete task' });
            }
        }
    }
    async getCriticalPath(req, res) {
        try {
            const { projectId } = req.params;
            const criticalPath = await this.taskService.calculateCriticalPath(projectId);
            res.json(criticalPath);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to calculate critical path' });
        }
    }
}
