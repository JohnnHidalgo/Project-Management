import { Prisma } from '../../dist/.prisma/client';
import { prisma } from '../index.js';

export class ChangeRequestRepository {
  async findAll() {
    return await prisma.changeRequest.findMany({
      include: {
        task: true,
        requester: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.changeRequest.findUnique({
      where: { id },
      include: {
        task: true,
        requester: true
      }
    });
  }

  async findByTask(taskId: string) {
    return await prisma.changeRequest.findMany({
      where: { taskId },
      include: {
        task: true,
        requester: true
      }
    });
  }

  async create(data: any) {
    return await prisma.changeRequest.create({
      data,
      include: {
        task: true,
        requester: true
      }
    });
  }

  async update(id: string, data: any) {
    return await prisma.changeRequest.update({
      where: { id },
      data,
      include: {
        task: true,
        requester: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.changeRequest.delete({
      where: { id }
    });
  }
}