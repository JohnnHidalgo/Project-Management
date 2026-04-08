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
    async findById(id) {
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
    async findByMilestone(milestoneId) {
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
    async findByRiskAction(riskActionId) {
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
    async findByProject(projectId) {
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
    async create(data) {
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
    async update(id, data) {
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
    async delete(id) {
        return await prisma.task.delete({
            where: { id }
        });
    }
}
