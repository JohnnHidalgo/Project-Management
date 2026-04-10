import { TaskRepository } from '../repositories/taskRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Prisma } from '../../dist/.prisma/client';

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

  async getTasksByProject(projectId: string) {
    return await this.taskRepository.findByProject(projectId);
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

  async calculateCriticalPath(projectId: string) {
    const tasks = await this.getTasksByProject(projectId);
    
    if (tasks.length === 0) {
      return {
        criticalPath: [],
        totalDuration: 0,
        tasks: []
      };
    }

    // Build dependency graph
    const taskMap = new Map<string, any>();
    const dependencyGraph = new Map<string, string[]>();
    const reverseGraph = new Map<string, string[]>();

    // Initialize graphs
    tasks.forEach(task => {
      taskMap.set(task.id, task);
      dependencyGraph.set(task.id, []);
      reverseGraph.set(task.id, []);
    });

    // Build dependencies
    tasks.forEach(task => {
      if (task.predecessorId) {
        dependencyGraph.get(task.predecessorId)!.push(task.id);
        reverseGraph.get(task.id)!.push(task.predecessorId);
      }
    });

    // Calculate duration in days
    const getDuration = (task: any): number => {
      if (task.startDate && task.endDate) {
        const diffTime = Math.abs(task.endDate.getTime() - task.startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
      }
      return 1; // default 1 day
    };

    // Forward pass: calculate ES and EF
    const earliestStart = new Map<string, number>();
    const earliestFinish = new Map<string, number>();
    
    // Find tasks with no predecessors (start tasks)
    const startTasks = tasks.filter(task => !task.predecessorId);
    
    // Initialize start tasks
    startTasks.forEach(task => {
      earliestStart.set(task.id, 0);
      earliestFinish.set(task.id, getDuration(task));
    });

    // Process remaining tasks
    const visited = new Set<string>();
    const processTask = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const predecessors = reverseGraph.get(taskId) || [];
      if (predecessors.length > 0) {
        // Wait for all predecessors to be processed
        predecessors.forEach(predId => processTask(predId));
        
        // ES = max(EF of predecessors)
        const maxEF = Math.max(...predecessors.map(predId => earliestFinish.get(predId)!));
        earliestStart.set(taskId, maxEF);
        earliestFinish.set(taskId, maxEF + getDuration(taskMap.get(taskId)));
      }

      // Process successors
      const successors = dependencyGraph.get(taskId) || [];
      successors.forEach(succId => processTask(succId));
    };

    // Process all tasks
    tasks.forEach(task => processTask(task.id));

    // Backward pass: calculate LS and LF
    const latestStart = new Map<string, number>();
    const latestFinish = new Map<string, number>();
    
    // Find end tasks (no successors)
    const endTasks = tasks.filter(task => (dependencyGraph.get(task.id) || []).length === 0);
    
    // Project end date is the max EF
    const projectEnd = Math.max(...Array.from(earliestFinish.values()));
    
    // Initialize end tasks
    endTasks.forEach(task => {
      latestFinish.set(task.id, projectEnd);
      latestStart.set(task.id, projectEnd - getDuration(task));
    });

    // Process backward
    const visitedBackward = new Set<string>();
    const processBackward = (taskId: string) => {
      if (visitedBackward.has(taskId)) return;
      visitedBackward.add(taskId);

      const successors = dependencyGraph.get(taskId) || [];
      if (successors.length > 0) {
        // Wait for all successors to be processed
        successors.forEach(succId => processBackward(succId));
        
        // LF = min(LS of successors)
        const minLS = Math.min(...successors.map(succId => latestStart.get(succId)!));
        latestFinish.set(taskId, minLS);
        latestStart.set(taskId, minLS - getDuration(taskMap.get(taskId)));
      }

      // Process predecessors
      const predecessors = reverseGraph.get(taskId) || [];
      predecessors.forEach(predId => processBackward(predId));
    };

    // Process all tasks backward
    tasks.forEach(task => processBackward(task.id));

    // Identify critical path: tasks where ES = LS and EF = LF
    const criticalTasks = tasks.filter(task => {
      const es = earliestStart.get(task.id) || 0;
      const ls = latestStart.get(task.id) || 0;
      const ef = earliestFinish.get(task.id) || 0;
      const lf = latestFinish.get(task.id) || 0;
      return Math.abs(es - ls) < 0.1 && Math.abs(ef - lf) < 0.1;
    });

    // Sort critical tasks by earliest start
    criticalTasks.sort((a, b) => (earliestStart.get(a.id) || 0) - (earliestStart.get(b.id) || 0));

    // Prepare result with timing information
    const tasksWithTiming = tasks.map(task => ({
      ...task,
      earliestStart: earliestStart.get(task.id) || 0,
      earliestFinish: earliestFinish.get(task.id) || 0,
      latestStart: latestStart.get(task.id) || 0,
      latestFinish: latestFinish.get(task.id) || 0,
      isCritical: criticalTasks.some(ct => ct.id === task.id),
      duration: getDuration(task)
    }));

    return {
      criticalPath: criticalTasks,
      totalDuration: projectEnd,
      tasks: tasksWithTiming
    };
  }
}