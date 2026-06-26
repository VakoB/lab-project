import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';

interface CreateMessageInput {
  senderId: string;
  conversationId: string;
  content: string;
}

interface UpdateMessageInput {
  content?: string;
}

@Injectable()
export class MessageService {
  async create(data: CreateMessageInput) {
    try {
      return await prisma.message.create({ data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    const message = await prisma.message.findFirst({
      where: { id, deletedAt: null },
    });
    if (!message) throw new NotFoundException(`Message ${id} not found`);
    return message;
  }

  async update(id: string, data: UpdateMessageInput) {
    await this.findById(id);
    try {
      return await prisma.message.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    try {
      return await prisma.message.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async list(conversationId: string) {
    try {
      return await prisma.message.findMany({
        where: {
          deletedAt: null,
          conversationId,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
