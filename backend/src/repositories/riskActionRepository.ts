import { Prisma } from '../../.prisma/client';
import { prisma } from '../index.js';

export class RiskActionRepository {
  async findAll() {
    return await prisma.riskAction.findMany({
      include: {
        risk: true,
        owner: true
      }
    });
  }

  async findById(id: string) {
    return await prisma.riskAction.findUnique({
      where: { id },
      include: {
        risk: true,
        owner: true
      }
    });
  }

  async findByRisk(riskId: string) {
    return await prisma.riskAction.findMany({
      where: { riskId },
      include: {
        owner: true
      }
    });
  }

  async create(data: Prisma.RiskActionCreateInput) {
    return await prisma.riskAction.create({
      data,
      include: {
        risk: true,
        owner: true
      }
    });
  }

  async update(id: string, data: Prisma.RiskActionUpdateInput) {
    return await prisma.riskAction.update({
      where: { id },
      data,
      include: {
        risk: true,
        owner: true
      }
    });
  }

  async delete(id: string) {
    return await prisma.riskAction.delete({
      where: { id }
    });
  }
}
