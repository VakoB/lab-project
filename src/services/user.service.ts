import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';

interface CreateUserInput {
  organizationId: string;
  username: string;
  email: string;
  passwordHash: string;
}

interface UpdateUserInput {
  username?: string;
  email?: string;
  passwordHash?: string;
}

@Injectable()
export class UserService {
  async create(data: CreateUserInput) {
    try {
      return await prisma.user.create({ data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: string, data: UpdateUserInput) {
    await this.findById(id);
    try {
      return await prisma.user.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    try {
      return await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async list() {
    try {
      return prisma.user.findMany({
        where: { deletedAt: null },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
