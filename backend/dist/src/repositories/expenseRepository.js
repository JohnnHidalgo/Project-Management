import { prisma } from '../index.js';
export class ExpenseRepository {
    async findAll() {
        return await prisma.expense.findMany({
            include: {
                project: true,
                budgetLine: true
            }
        });
    }
    async findById(id) {
        return await prisma.expense.findUnique({
            where: { id },
            include: {
                project: true,
                budgetLine: true
            }
        });
    }
    async findByProject(projectId) {
        return await prisma.expense.findMany({
            where: { projectId },
            include: {
                budgetLine: true
            }
        });
    }
    async create(data) {
        return await prisma.expense.create({
            data,
            include: {
                project: true,
                budgetLine: true
            }
        });
    }
    async update(id, data) {
        return await prisma.expense.update({
            where: { id },
            data,
            include: {
                project: true,
                budgetLine: true
            }
        });
    }
    async delete(id) {
        return await prisma.expense.delete({
            where: { id }
        });
    }
}
