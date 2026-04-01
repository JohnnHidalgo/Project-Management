import { prisma } from '../index.js';
export class TaskLogRepository {
    async findAll() {
        return await prisma.taskLog.findMany({
            include: {
                task: true,
                user: true
            }
        });
    }
    async findById(id) {
        return await prisma.taskLog.findUnique({
            where: { id },
            include: {
                task: true,
                user: true
            }
        });
    }
    async findByTask(taskId) {
        return await prisma.taskLog.findMany({
            where: { taskId },
            include: {
                user: true
            },
            orderBy: {
                date: 'desc'
            }
        });
    }
    async create(data) {
        return await prisma.taskLog.create({
            data,
            include: {
                task: true,
                user: true
            }
        });
    }
    async update(id, data) {
        return await prisma.taskLog.update({
            where: { id },
            data,
            include: {
                task: true,
                user: true
            }
        });
    }
    async delete(id) {
        return await prisma.taskLog.delete({
            where: { id }
        });
    }
}
