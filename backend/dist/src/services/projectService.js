import { ProjectRepository } from '../repositories/projectRepository.js';
export class ProjectService {
    projectRepository;
    constructor() {
        this.projectRepository = new ProjectRepository();
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
        return await this.projectRepository.create(payload);
    }
    async updateProject(id, data) {
        // Validate the project exists
        await this.getProjectById(id);
        // Business logic validation
        if (data.budget !== undefined && data.budget < 0) {
            throw new Error('Budget cannot be negative');
        }
        if (data.startDate && data.endDate && data.startDate > data.endDate) {
            throw new Error('Start date cannot be after end date');
        }
        return await this.projectRepository.update(id, data);
    }
    async deleteProject(id) {
        // Validate the project exists
        await this.getProjectById(id);
        return await this.projectRepository.delete(id);
    }
}
