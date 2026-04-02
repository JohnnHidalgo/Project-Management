import { prisma } from '../index.js';
export class BudgetLineRepository {
    async findAll() {
        return await prisma.budgetLine.findMany({
            include: {
                project: true,
                approvedByUser: true,
                expenses: true
            }
        });
    }
    async findById(id) {
        return await prisma.budgetLine.findUnique({
            where: { id },
            include: {
                project: true,
                approvedByUser: true,
                expenses: true
            }
        });
    }
    async findByProject(projectId) {
        return await prisma.budgetLine.findMany({
            where: { projectId },
            include: {
                project: true,
                approvedByUser: true,
                expenses: true
            }
        });
    }
    async create(data) {
        return await prisma.budgetLine.create({
            data,
            include: {
                project: true,
                approvedByUser: true,
                expenses: true
            }
        });
    }
    async update(id, data) {
        return await prisma.budgetLine.update({
            where: { id },
            data,
            include: {
                project: true,
                approvedByUser: true,
                expenses: true
            }
        });
    }
    async delete(id) {
        return await prisma.budgetLine.delete({
            where: { id }
        });
    }
}
