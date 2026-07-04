import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';

interface CreateConversationInput {
  ownerId: string;
  title: string;
}

interface UpdateConversationInput {
  title?: string;
}

@Injectable()
export class ConversationService {
  async create(data: CreateConversationInput) {
    try {
      return await prisma.conversation.create({ data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    const conversation = await prisma.conversation.findFirst({
      where: { id, deletedAt: null },
    });
    if (!conversation)
      throw new NotFoundException(`Conversation ${id} not found`);
    return conversation;
  }

  async update(id: string, data: UpdateConversationInput) {
    await this.findById(id);
    try {
      return await prisma.conversation.update({ where: { id }, data });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    try {
      return await prisma.conversation.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async list(ownerId: string) {
    try {
      return await prisma.conversation.findMany({
        where: {
          deletedAt: null,
          ownerId,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // cursor pagination
  async listAllPaginated(take: number = 20, ownerId: string, cursor?: string) {
    const conversations = await prisma.conversation.findMany({
      where: { deletedAt: null, ownerId },
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
    });

    const nextCursor =
      conversations.length === take
        ? conversations[conversations.length - 1].id
        : null;
    return {
      data: conversations,
      nextCursor,
    };
  }
}
