import { ProjectHistoryRepository } from '../repositories/projectHistoryRepository.js';
import { Prisma } from '@prisma/client';

export class ProjectHistoryService {
  private projectHistoryRepository: ProjectHistoryRepository;

  constructor() {
    this.projectHistoryRepository = new ProjectHistoryRepository();
  }

  async getAllProjectHistories() {
    return this.projectHistoryRepository.findAll();
  }

  async getProjectHistoryByProject(projectId: string) {
    return this.projectHistoryRepository.findByProject(projectId);
  }

  async record(projectId: string | null, entity: string, entityId: string | null, action: string, details?: any, userId?: string) {
    const payload: Prisma.ProjectHistoryCreateInput = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectId: projectId || undefined,
      entity,
      entityId: entityId || undefined,
      action,
      details: details ? details : undefined,
      userId: userId || undefined,
      createdAt: new Date()
    } as any;

    return this.projectHistoryRepository.create(payload);
  }
}
