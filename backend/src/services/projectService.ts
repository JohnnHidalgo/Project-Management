import { ProjectRepository } from '../repositories/projectRepository.js';
import { ProjectHistoryService } from './projectHistoryService.js';
import { Project, ProjectStatus, Prisma } from '../../.prisma/client';

export class ProjectService {
  private projectRepository: ProjectRepository;
  private projectHistoryService: ProjectHistoryService;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.projectHistoryService = new ProjectHistoryService();
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
    if ((data as any).sponsorIds && Array.isArray((data as any).sponsorIds) && (data as any).sponsorIds.length) {
      const sponsorIds = (data as any).sponsorIds as string[];
      payload.sponsors = {
        create: sponsorIds.map(sponsorId => ({ sponsor: { connect: { id: sponsorId } } }))
      };
    }
    delete payload.sponsorIds;

    if ((data as any).teamMemberIds && Array.isArray((data as any).teamMemberIds) && (data as any).teamMemberIds.length) {
      const teamMemberIds = (data as any).teamMemberIds as string[];
      payload.teamMembers = {
        create: teamMemberIds.map(memberId => ({ teamMember: { connect: { id: memberId } } }))
      };
    }
    delete payload.teamMemberIds;

    // Handle nested specific objectives
    if ((data as any).specificObjectives && Array.isArray((data as any).specificObjectives) && (data as any).specificObjectives.length) {
      const specificObjectives = (data as any).specificObjectives as Array<Partial<any>>;
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

    await this.projectHistoryService.record(
      createdProject.id,
      'Project',
      createdProject.id,
      'Created',
      { project: createdProject },
      undefined
    );

    return createdProject;
  }

  async updateProject(id: string, data: Partial<Project>, userId?: string, userRole?: string) {
    // Validate the project exists
    const existingProject = await this.getProjectById(id);

    // Get all sponsor IDs for this project
    const sponsorIds = existingProject.sponsors?.map((s: any) => s.sponsorId) || [];
    const isProjectSponsor = sponsorIds.includes(userId);

    // Authorization logic:
    // 1. PM can only edit when pmCanEdit is true (not during Charter_Approval)
    // 2. Sponsors can edit when project is in Charter_Approval status
    // 3. PMO and Admin can always edit
    
    if (userRole === 'PM') {
      if (existingProject.pmId !== userId) {
        throw new Error('Only the assigned PM can edit this project');
      }
      if (existingProject.status === 'Charter_Approval') {
        throw new Error('PM cannot edit project during Charter_Approval');
      }
      if (!existingProject.pmCanEdit) {
        throw new Error('PM cannot edit project until PMO grants permission');
      }
    } else if (userRole === 'Sponsor') {
      if (!isProjectSponsor) {
        throw new Error('You are not a sponsor for this project');
      }
      // Sponsors can only change status during Charter_Approval
      if (existingProject.status !== 'Charter_Approval' && data.status !== undefined) {
        throw new Error('Sponsors can only approve or reject projects in Charter_Approval status');
      }
    } else if (userRole !== 'PMO' && userRole !== 'Admin') {
      throw new Error('You do not have permission to edit this project');
    }

    // Business logic validation
    if (data.budget !== undefined && data.budget < 0) {
      throw new Error('Budget cannot be negative');
    }

    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new Error('Start date cannot be after end date');
    }

    const updatedProject = await this.projectRepository.update(id, data);

    await this.projectHistoryService.record(
      updatedProject.id,
      'Project',
      updatedProject.id,
      'Updated',
      { updates: data, project: updatedProject },
      userId
    );

    return updatedProject;
  }

  async togglePmCanEdit(id: string, pmCanEdit: boolean) {
    // Validate the project exists
    await this.getProjectById(id);

    const updatedProject = await this.projectRepository.update(id, { pmCanEdit });

    await this.projectHistoryService.record(
      updatedProject.id,
      'Project',
      updatedProject.id,
      pmCanEdit ? 'PM Edit Enabled' : 'PM Edit Disabled',
      { pmCanEdit },
      undefined
    );

    return updatedProject;
  }

  async deleteProject(id: string) {
    // Validate the project exists
    const projectToDelete = await this.getProjectById(id);

    const deletedProject = await this.projectRepository.delete(id);

    await this.projectHistoryService.record(
      projectToDelete.id,
      'Project',
      projectToDelete.id,
      'Deleted',
      { project: projectToDelete },
      undefined
    );

    return deletedProject;
  }
}