import { prisma } from '../index.js';
export class UserRepository {
    async findAll() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phone: true,
                position: true,
                projectsAsPM: true,
                projectsAsPMO: true,
                sponsorLinks: {
                    include: {
                        project: true
                    }
                },
                teamLinks: {
                    include: {
                        project: true
                    }
                },
                tasks: true,
                taskLogs: true,
                riskOwned: true,
                riskActions: true,
                issuesOwned: true,
                changeRequestsRequested: true,
                stakeholders: true,
                lessonLearned: true,
                approvedBudgetLines: true
            }
        });
    }
    async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phone: true,
                position: true,
                projectsAsPM: true,
                projectsAsPMO: true,
                sponsorLinks: {
                    include: {
                        project: true
                    }
                },
                teamLinks: {
                    include: {
                        project: true
                    }
                },
                tasks: true,
                taskLogs: true,
                riskOwned: true,
                riskActions: true,
                issuesOwned: true,
                changeRequestsRequested: true,
                stakeholders: true,
                lessonLearned: true,
                approvedBudgetLines: true
            }
        });
    }
    async create(data) {
        return await prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phone: true,
                position: true,
                projectsAsPM: true,
                projectsAsPMO: true
            }
        });
    }
    async update(id, data) {
        return await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                phone: true,
                position: true,
                projectsAsPM: true,
                projectsAsPMO: true,
                sponsorLinks: {
                    include: {
                        project: true
                    }
                },
                teamLinks: {
                    include: {
                        project: true
                    }
                }
            }
        });
    }
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email }
        });
    }
    async delete(id) {
        return await prisma.user.delete({
            where: { id }
        });
    }
}
