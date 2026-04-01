import { prisma } from '../index.js';
export class MilestoneRepository {
    async findAll() {
        return await prisma.milestone.findMany({
            include: {
                project: true,
                tasks: true
            }
        });
    }
    async findById(id) {
        return await prisma.milestone.findUnique({
            where: { id },
            include: {
                project: true,
                tasks: true
            }
        });
    }
    async findByProject(projectId) {
        return await prisma.milestone.findMany({
            where: { projectId },
            include: {
                tasks: true
            }
        });
    }
    async create(data) {
        return await prisma.milestone.create({
            data,
            include: {
                project: true,
                tasks: true
            }
        });
    }
    async update(id, data) {
        return await prisma.milestone.update({
            where: { id },
            data,
            include: {
                project: true,
                tasks: true
            }
        });
    }
    async delete(id) {
        return await prisma.milestone.delete({
            where: { id }
        });
    }
}
