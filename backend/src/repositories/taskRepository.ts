import { Prisma } from '../../dist/.prisma/client';
import { prisma } from '../index.js';

export class TaskRepository {
  async findAll() {
    return await prisma.task.findMany({
      include: {
        milestone: {
          include: {
            project: true
          }
        },
        riskAction: {
          include: {
            risk: {
              include: {
                project: true
              }
            }
          }
        },
        assignedUser: true,
        predecessor: true,
        successor: true,
        logs: true,
        changeRequests: true,
        issues: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.task.findUnique({
      where: { id },
      include: {
        milestone: {
          include: {
            project: true
          }
        },
        riskAction: {
          include: {
            risk: {
              include: {
                project: true
              }
            }
          }
        },
        assignedUser: true,
        predecessor: true,
        successor: true,
        logs: true,
        changeRequests: true,
        issues: true
      }
    });
  }

  async findByMilestone(milestoneId: string) {
    return await prisma.task.findMany({
      where: { milestoneId },
      include: {
        assignedUser: true,
        predecessor: true,
        successor: true,
        logs: true,
        changeRequests: true,
        issues: true
      }
    });
  }

  async findByRiskAction(riskActionId: string) {
    return await prisma.task.findMany({
      where: { riskActionId },
      include: {
        assignedUser: true,
        predecessor: true,
        successor: true,
        logs: true,
        changeRequests: true,
        issues: true
      }
    });
  }

  async findByProject(projectId: string) {
    return await prisma.task.findMany({
      where: {
        OR: [
          {
            milestone: {
              projectId: projectId
            }
          },
          {
            riskAction: {
              risk: {
                projectId: projectId
              }
            }
          }
        ]
      },
      include: {
        milestone: {
          include: {
            project: true
          }
        },
        riskAction: {
          include: {
            risk: {
              include: {
                project: true
              }
            }
          }
        },
        assignedUser: true,
        predecessor: true,
        successor: true,
        logs: true,
        changeRequests: true,
        issues: true
      }
    });
  }

  async create(data: Prisma.TaskCreateInput) {
    return await prisma.task.create({
      data,
      include: {
        milestone: {
          include: {
            project: true
          }
        },
        riskAction: {
          include: {
            risk: {
              include: {
                project: true
              }
            }
          }
        },
        assignedUser: true,
        predecessor: true,
        successor: true
      }
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    return await prisma.task.update({
      where: { id },
      data,
      include: {
        milestone: {
          include: {
            project: true
          }
        },
        riskAction: {
          include: {
            risk: {
              include: {
                project: true
              }
            }
          }
        },
        assignedUser: true,
        predecessor: true,
        successor: true,
        logs: true,
        changeRequests: true,
        issues: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.task.delete({
      where: { id }
    });
  }
}
