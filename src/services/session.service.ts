import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';

interface CreateSessionInput {
  userId: string;
  token: string;
  expiresAt: Date;
}

interface UpdateSessionInput {
  token?: string;
  expiresAt?: Date;
}

@Injectable()
export class SessionService {
  async create(data: CreateSessionInput) {
    try {
      return await prisma.session.create({ data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async update(id: string, data: UpdateSessionInput) {
    try {
      return await prisma.session.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    try {
      return await prisma.session.delete({ where: { id } });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async list(userId: string) {
    try {
      return await prisma.session.findMany({
        where: { userId },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
