import { prisma } from '../index.js';
export class RiskRepository {
    async findAll() {
        return await prisma.risk.findMany({
            include: {
                project: true,
                owner: true,
                actions: true
            }
        });
    }
    async findById(id) {
        return await prisma.risk.findUnique({
            where: { id },
            include: {
                project: true,
                owner: true,
                actions: true
            }
        });
    }
    async findByProject(projectId) {
        return await prisma.risk.findMany({
            where: { projectId },
            include: {
                owner: true,
                actions: true
            }
        });
    }
    async create(data) {
        return await prisma.risk.create({
            data,
            include: {
                project: true,
                owner: true,
                actions: true
            }
        });
    }
    async update(id, data) {
        return await prisma.risk.update({
            where: { id },
            data,
            include: {
                project: true,
                owner: true,
                actions: true
            }
        });
    }
    async delete(id) {
        return await prisma.risk.delete({
            where: { id }
        });
    }
}
