import { Prisma, Project, ProjectStatus } from '../../.prisma/client';
import { prisma } from '../index.js';

export class ProjectRepository {
  async findAll() {
    return await prisma.project.findMany({
      include: {
        pm: true,
        pmo: true,
        sponsors: {
          include: {
            sponsor: true
          }
        },
        teamMembers: {
          include: {
            teamMember: true
          }
        },
        specificObjectives: true,
        budgetLines: true,
        milestones: true,
        risks: true,
        issues: true,
        expenses: true,
        stakeholders: {
          include: {
            user: true
          }
        },
        projectSnapshots: true,
        lessonsLearned: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        pm: true,
        pmo: true,
        sponsors: {
          include: {
            sponsor: true
          }
        },
        teamMembers: {
          include: {
            teamMember: true
          }
        },
        specificObjectives: true,
        budgetLines: true,
        milestones: true,
        risks: true,
        issues: true,
        expenses: true,
        stakeholders: {
          include: {
            user: true
          }
        },
        projectSnapshots: true,
        lessonsLearned: true
      }
    });
  }

  async create(data: Prisma.ProjectCreateInput) {
    return await prisma.project.create({
      data,
      include: {
        pm: true,
        pmo: true,
        sponsors: {
          include: {
            sponsor: true
          }
        },
        teamMembers: {
          include: {
            teamMember: true
          }
        }
      }
    });
  }

  async update(id: string, data: Partial<Project>) {
    return await prisma.project.update({
      where: { id },
      data,
      include: {
        pm: true,
        pmo: true,
        sponsors: {
          include: {
            sponsor: true
          }
        },
        teamMembers: {
          include: {
            teamMember: true
          }
        }
      }
    });
  }

  async delete(id: string) {
    return await prisma.project.delete({
      where: { id }
    });
  }
}