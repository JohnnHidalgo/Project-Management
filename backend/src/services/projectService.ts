import { ProjectRepository } from '../repositories/projectRepository';
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
    if (data.budget < 0) {
      throw new Error('Budget cannot be negative');
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    return await this.projectRepository.create(data);
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