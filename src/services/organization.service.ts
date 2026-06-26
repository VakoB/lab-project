import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';

interface CreateOrganizationInput {
  name: string;
}

interface UpdateOrganizationInput {
  name?: string;
}

@Injectable()
export class OrganizationService {
  async create(data: CreateOrganizationInput) {
    try {
      return await prisma.organization.create({ data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    const org = await prisma.organization.findFirst({
      where: { id, deletedAt: null },
    });
    if (!org) throw new NotFoundException(`Organization ${id} not found`);
    return org;
  }

  async update(id: string, data: UpdateOrganizationInput) {
    try {
      return await prisma.organization.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    try {
      return await prisma.organization.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async list() {
    try {
      return await prisma.organization.findMany({
        where: { deletedAt: null },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
