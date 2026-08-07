import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { plainToInstance } from 'class-transformer';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class MessageService {
  async create(data: CreateMessageDto) {
    try {
      const message = await prisma.message.create({ data });
      return plainToInstance(MessageEntity, message, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    const message = await prisma.message.findFirst({
      where: { id, deletedAt: null },
    });
    if (!message) throw new NotFoundException(`Message ${id} not found`);
    return plainToInstance(MessageEntity, message, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, data: UpdateMessageDto) {
    await this.findById(id);
    try {
      const updatedMessage = await prisma.message.update({
        where: { id },
        data,
      });
      return plainToInstance(MessageEntity, updatedMessage, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    try {
      await prisma.message.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // cursor pagination
  async findAll(conversationId: string, take: number = 20, cursor?: string) {
    const messages = await prisma.message.findMany({
      where: { deletedAt: null, conversationId },
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
      select: { id: true, content: true, senderId: true, conversationId: true },
    });

    const nextCursor =
      messages.length === take ? messages[messages.length - 1].id : null;

    const serializedMessages = plainToInstance(MessageEntity, messages, {
      excludeExtraneousValues: true,
    });
    return {
      data: serializedMessages,
      nextCursor,
    };
  }
}
