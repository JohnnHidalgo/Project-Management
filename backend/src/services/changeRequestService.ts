import { ChangeRequestRepository } from '../repositories/changeRequestRepository.js';
import { TaskRepository } from '../repositories/taskRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Prisma } from '@prisma/client';

export class ChangeRequestService {
  private changeRequestRepository: ChangeRequestRepository;
  private taskRepository: TaskRepository;
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.changeRequestRepository = new ChangeRequestRepository();
    this.taskRepository = new TaskRepository();
    this.projectHistoryService = new ProjectHistoryService();
  }

  async getAllChangeRequests() {
    return await this.changeRequestRepository.findAll();
  }

  async getChangeRequestById(id: string) {
    const changeRequest = await this.changeRequestRepository.findById(id);
    if (!changeRequest) {
      throw new Error('Change request not found');
    }
    return changeRequest;
  }

  async getChangeRequestsByTask(taskId: string) {
    return await this.changeRequestRepository.findByTask(taskId);
  }

  async createChangeRequest(data: Prisma.ChangeRequestCreateInput) {
    // Business logic validation
    const taskId = (data as any).taskId;
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const requestedBy = (data as any).requestedBy;
    if (!requestedBy) {
      throw new Error('Requester ID is required');
    }

    if (!data.justification || (typeof data.justification === 'string' && data.justification.trim().length === 0)) {
      throw new Error('Justification is required');
    }

    // Validate that the task exists
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Set original dates from the current task
    const payload: any = {
      ...data,
      id: (data as any).id || `cr${Date.now()}`,
      originalStartDate: task.startDate || new Date(),
      originalEndDate: task.endDate || new Date(),
      requestedDate: data.requestedDate ? new Date(data.requestedDate) : new Date(),
      task: { connect: { id: taskId } },
      requester: { connect: { id: requestedBy } },
    };

    delete payload.taskId;
    delete payload.requestedBy;

    const createdCR = await this.changeRequestRepository.create(payload);
    const projectId = task?.milestone?.projectId ?? null;
    await this.projectHistoryService.record(projectId, 'ChangeRequest', createdCR.id, 'Created', { changeRequest: createdCR }, requestedBy);
    return createdCR;
  }

  async updateChangeRequest(id: string, data: Prisma.ChangeRequestUpdateInput) {
    // Validate the change request exists
    const existingCR = await this.getChangeRequestById(id);
    const task = existingCR.taskId ? await this.taskRepository.findById(existingCR.taskId) : null;
    const projectId = task?.milestone?.projectId ?? null;

    const updatedCR = await this.changeRequestRepository.update(id, data);
    await this.projectHistoryService.record(projectId, 'ChangeRequest', id, 'Updated', { updates: data }, (data as any).updatedBy || null);
    return updatedCR;
  }

  async deleteChangeRequest(id: string) {
    // Validate the change request exists
    const crToDelete = await this.getChangeRequestById(id);

    const deletedCR = await this.changeRequestRepository.delete(id);
    const task = await this.taskRepository.findById(crToDelete.taskId);
    const projectId = task?.milestone?.projectId ?? null;
    await this.projectHistoryService.record(projectId, 'ChangeRequest', id, 'Deleted', { changeRequest: crToDelete });
    return deletedCR;
  }

  async processChangeRequest(id: string, status: 'Approved' | 'Rejected') {
    const changeRequest = await this.getChangeRequestById(id);

    if (changeRequest.status !== 'Pending') {
      throw new Error('Change request has already been processed');
    }

    // Update the change request status
    const updatedCR = await this.changeRequestRepository.update(id, { status });

    // If approved, update the task dates
    if (status === 'Approved') {
      await this.taskRepository.update(changeRequest.taskId, {
        startDate: changeRequest.newStartDate,
        endDate: changeRequest.newEndDate
      });
    }

    return updatedCR;
  }
}
