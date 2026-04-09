import { ProjectSnapshotRepository } from '../repositories/projectSnapshotRepository.js';

export class ProjectSnapshotService {
  private repository: ProjectSnapshotRepository;

  constructor() {
    this.repository = new ProjectSnapshotRepository();
  }

  async getAllSnapshots() {
    return await this.repository.findAll();
  }

  async getSnapshotsByProject(projectId: string) {
    if (!projectId) {
      throw new Error('projectId is required');
    }
    return await this.repository.findByProject(projectId);
  }

  async getSnapshotById(id: string) {
    const snapshot = await this.repository.findById(id);
    if (!snapshot) {
      throw new Error('Snapshot not found');
    }
    return snapshot;
  }

  async createSnapshot(data: any) {
    const projectId = data.projectId;
    if (!projectId) {
      throw new Error('projectId is required');
    }

    const payload: any = {
      ...data,
      id: data.id || `snap-${Date.now()}`,
      date: typeof data.date === 'string' ? new Date(data.date) : data.date,
      project: {
        connect: {
          id: projectId
        }
      }
    };

    delete payload.projectId;

    return await this.repository.create(payload);
  }
}
