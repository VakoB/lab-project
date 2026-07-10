import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { plainToInstance } from 'class-transformer';
import { ConversationEntity } from './entities/conversation.entity';

@Injectable()
export class ConversationService {
  async create(data: CreateConversationDto) {
    try {
      const conversation = await prisma.conversation.create({ data });
      return plainToInstance(ConversationEntity, conversation, {
        excludeExtraneousValues: true,
      });
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
    return plainToInstance(ConversationEntity, conversation, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, data: UpdateConversationDto) {
    await this.findById(id);
    try {
      const updatedConversation = await prisma.conversation.update({
        where: { id },
        data,
      });
      return plainToInstance(ConversationEntity, updatedConversation, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    try {
      await prisma.conversation.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // cursor pagination
  async findAll(ownerId: string, take: number = 20, cursor?: string) {
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

    const serializedConversations = plainToInstance(
      ConversationEntity,
      conversations,
      {
        excludeExtraneousValues: true,
      },
    );
    return {
      data: serializedConversations,
      nextCursor,
    };
  }
}
