import { ProjectRepository } from '../repositories/projectRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
export class ProjectService {
    projectRepository;
    projectHistoryService;
    constructor() {
        this.projectRepository = new ProjectRepository();
        this.projectHistoryService = new ProjectHistoryService();
    }
    async getAllProjects() {
        return await this.projectRepository.findAll();
    }
    async getProjectById(id) {
        const project = await this.projectRepository.findById(id);
        if (!project) {
            throw new Error('Project not found');
        }
        return project;
    }
    async createProject(data) {
        // Business logic validation
        if (data.budget !== undefined && data.budget < 0) {
            throw new Error('Budget cannot be negative');
        }
        if (data.startDate && data.endDate && data.startDate > data.endDate) {
            throw new Error('Start date cannot be after end date');
        }
        // Generate ID when missing, because schema has no @default
        const id = data.id || `p${Date.now()}`;
        const payload = {
            ...data,
            id,
            status: data.status || 'Draft'
        };
        // Handle sponsor/team member join-table relations from flat array value
        if (data.sponsorIds && Array.isArray(data.sponsorIds) && data.sponsorIds.length) {
            const sponsorIds = data.sponsorIds;
            payload.sponsors = {
                create: sponsorIds.map(sponsorId => ({ sponsor: { connect: { id: sponsorId } } }))
            };
        }
        delete payload.sponsorIds;
        if (data.teamMemberIds && Array.isArray(data.teamMemberIds) && data.teamMemberIds.length) {
            const teamMemberIds = data.teamMemberIds;
            payload.teamMembers = {
                create: teamMemberIds.map(memberId => ({ teamMember: { connect: { id: memberId } } }))
            };
        }
        delete payload.teamMemberIds;
        // Handle nested specific objectives
        if (data.specificObjectives && Array.isArray(data.specificObjectives) && data.specificObjectives.length) {
            const specificObjectives = data.specificObjectives;
            payload.specificObjectives = {
                create: specificObjectives.map(so => ({
                    id: so.id || `so-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    description: so.description || '',
                    successCriteria: so.successCriteria || '',
                    kpi: so.kpi || ''
                }))
            };
        }
        delete payload.specificObjectives;
        // Convert short object names that might arrive from frontend (strings) into Prisma-compatible Date objects if needed
        if (payload.startDate && typeof payload.startDate === 'string') {
            payload.startDate = new Date(payload.startDate);
        }
        if (payload.endDate && typeof payload.endDate === 'string') {
            payload.endDate = new Date(payload.endDate);
        }
        const createdProject = await this.projectRepository.create(payload);
        await this.projectHistoryService.record(createdProject.id, 'Project', createdProject.id, 'Created', { project: createdProject }, undefined);
        return createdProject;
    }
    async updateProject(id, data, userId, userRole) {
        // Validate the project exists
        const existingProject = await this.getProjectById(id);
        // Check permissions based on pmCanEdit and user role
        if (userRole === 'PM' && !existingProject.pmCanEdit) {
            throw new Error('PM cannot edit project until PMO grants permission');
        }
        // PMO and Admin can always edit
        if (userRole !== 'PMO' && userRole !== 'Admin') {
            // Check if user is the assigned PM for this project
            if (existingProject.pmId !== userId) {
                throw new Error('Only assigned PM, PMO, or Admin can edit this project');
            }
        }
        // Business logic validation
        if (data.budget !== undefined && data.budget < 0) {
            throw new Error('Budget cannot be negative');
        }
        if (data.startDate && data.endDate && data.startDate > data.endDate) {
            throw new Error('Start date cannot be after end date');
        }
        const updatedProject = await this.projectRepository.update(id, data);
        await this.projectHistoryService.record(updatedProject.id, 'Project', updatedProject.id, 'Updated', { updates: data, project: updatedProject }, userId);
        return updatedProject;
    }
    async togglePmCanEdit(id, pmCanEdit) {
        // Validate the project exists
        await this.getProjectById(id);
        const updatedProject = await this.projectRepository.update(id, { pmCanEdit });
        await this.projectHistoryService.record(updatedProject.id, 'Project', updatedProject.id, pmCanEdit ? 'PM Edit Enabled' : 'PM Edit Disabled', { pmCanEdit }, undefined);
        return updatedProject;
    }
    async deleteProject(id) {
        // Validate the project exists
        const projectToDelete = await this.getProjectById(id);
        const deletedProject = await this.projectRepository.delete(id);
        await this.projectHistoryService.record(projectToDelete.id, 'Project', projectToDelete.id, 'Deleted', { project: projectToDelete }, undefined);
        return deletedProject;
    }
}
