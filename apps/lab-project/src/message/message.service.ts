import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ConversationService } from '../conversation/conversation.service';

@Injectable()
export class MessageService {
  constructor(private conversationService: ConversationService) {}

  async sendMessage(userId: string, input: CreateMessageDto) {
    const { content, conversationId, organizationId } = input;
    await this.conversationService.verifyParticipant(
      conversationId,
      userId,
      organizationId,
    );

    const message = await prisma.message.create({
      data: { content, conversationId, senderId: userId },
      include: { sender: true },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    organizationId: string,
    take: number = 50,
    cursor?: string,
  ) {
    await this.conversationService.verifyParticipant(
      conversationId,
      userId,
      organizationId,
    );

    const messages = await prisma.message.findMany({
      where: { conversationId },
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });

    const nextCursor =
      messages.length === take ? messages[messages.length - 1].id : null;

    return { data: messages, nextCursor };
  }

  async updateMessage(userId: string, input: UpdateMessageDto) {
    const { messageId, content } = input;
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Message not found');

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    return prisma.message.update({
      where: { id: messageId },
      data: { content },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) throw new NotFoundException('Message not found');

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return prisma.message.delete({ where: { id: messageId } });
  }
}
