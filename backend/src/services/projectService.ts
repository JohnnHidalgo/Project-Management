import { ProjectRepository } from '../repositories/projectRepository.js';
import { Project, ProjectStatus, Prisma } from '../../.prisma/client';

export class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async getAllProjects() {
    return await this.projectRepository.findAll();
  }

  async getProjectById(id: string) {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  }

  async createProject(data: Prisma.ProjectCreateInput) {
    // Business logic validation
    if (data.budget !== undefined && data.budget < 0) {
      throw new Error('Budget cannot be negative');
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    // Generate ID when missing, because schema has no @default
    const id = (data as any).id || `p${Date.now()}`;

    const payload: any = {
      ...data,
      id,
      status: data.status || 'Draft'
    };

    // Handle sponsor/team member join-table relations from flat array value
    if ((data as any).sponsorIds) {
      const sponsorIds = (data as any).sponsorIds as string[];
      payload.sponsors = {
        create: sponsorIds.map(sponsorId => ({ sponsor: { connect: { id: sponsorId } } }))
      };
      delete payload.sponsorIds;
    }

    if ((data as any).teamMemberIds) {
      const teamMemberIds = (data as any).teamMemberIds as string[];
      payload.teamMembers = {
        create: teamMemberIds.map(memberId => ({ teamMember: { connect: { id: memberId } } }))
      };
      delete payload.teamMemberIds;
    }

    // Convert short object names that might arrive from frontend (strings) into Prisma-compatible Date objects if needed
    if (payload.startDate && typeof payload.startDate === 'string') {
      payload.startDate = new Date(payload.startDate);
    }
    if (payload.endDate && typeof payload.endDate === 'string') {
      payload.endDate = new Date(payload.endDate);
    }

    return await this.projectRepository.create(payload);
  }

  async updateProject(id: string, data: Partial<Project>) {
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

  async deleteProject(id: string) {
    // Validate the project exists
    await this.getProjectById(id);

    return await this.projectRepository.delete(id);
  }
}