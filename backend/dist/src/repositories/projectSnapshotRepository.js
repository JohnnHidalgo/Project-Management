import { prisma } from '../index.js';
export class ProjectSnapshotRepository {
    async findAll() {
        return await prisma.projectSnapshot.findMany();
    }
    async findById(id) {
        return await prisma.projectSnapshot.findUnique({
            where: { id }
        });
    }
    async findByProject(projectId) {
        return await prisma.projectSnapshot.findMany({
            where: { projectId },
            orderBy: {
                date: 'desc'
            }
        });
    }
    async create(data) {
        return await prisma.projectSnapshot.create({
            data
        });
    }
}
