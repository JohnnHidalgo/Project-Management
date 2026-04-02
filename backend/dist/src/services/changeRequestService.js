import { ChangeRequestRepository } from '../repositories/changeRequestRepository.js';
import { TaskRepository } from '../repositories/taskRepository.js';
export class ChangeRequestService {
    changeRequestRepository;
    taskRepository;
    constructor() {
        this.changeRequestRepository = new ChangeRequestRepository();
        this.taskRepository = new TaskRepository();
    }
    async getAllChangeRequests() {
        return await this.changeRequestRepository.findAll();
    }
    async getChangeRequestById(id) {
        const changeRequest = await this.changeRequestRepository.findById(id);
        if (!changeRequest) {
            throw new Error('Change request not found');
        }
        return changeRequest;
    }
    async getChangeRequestsByTask(taskId) {
        return await this.changeRequestRepository.findByTask(taskId);
    }
    async createChangeRequest(data) {
        // Business logic validation
        const taskId = data.taskId;
        if (!taskId) {
            throw new Error('Task ID is required');
        }
        const requestedBy = data.requestedBy;
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
        const payload = {
            ...data,
            id: data.id || `cr${Date.now()}`,
            originalStartDate: task.startDate || new Date(),
            originalEndDate: task.endDate || new Date(),
            requestedDate: data.requestedDate ? new Date(data.requestedDate) : new Date(),
            task: { connect: { id: taskId } },
            requester: { connect: { id: requestedBy } },
        };
        delete payload.taskId;
        delete payload.requestedBy;
        return await this.changeRequestRepository.create(payload);
    }
    async updateChangeRequest(id, data) {
        // Validate the change request exists
        await this.getChangeRequestById(id);
        return await this.changeRequestRepository.update(id, data);
    }
    async deleteChangeRequest(id) {
        // Validate the change request exists
        await this.getChangeRequestById(id);
        return await this.changeRequestRepository.delete(id);
    }
    async processChangeRequest(id, status) {
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
