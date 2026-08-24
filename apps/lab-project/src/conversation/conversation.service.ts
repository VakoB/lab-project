import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationService {
  async createConversation(input: CreateConversationDto, userId: string) {
    const { participantId, organizationId, title } = input;

    const requestingUser = await prisma.user.findFirst({
      where: { id: userId, organizationId, deletedAt: null },
    });

    if (!requestingUser) {
      throw new ForbiddenException('You do not belong to this organization');
    }

    if (participantId === userId) {
      throw new BadRequestException('Cannot create a chat with yourself');
    }

    const participant = await prisma.user.findFirst({
      where: { id: participantId, organizationId, deletedAt: null },
    });

    if (!participant) {
      throw new BadRequestException(
        'Participant not found in the organization',
      );
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        organizationId,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: { participants: { include: { user: true } }, messages: true },
    });

    if (existing && existing.participants.length === 2) {
      return existing;
    }

    return prisma.conversation.create({
      data: {
        title: title || 'Chat',
        organizationId,
        ownerId: userId,
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
      include: { participants: { include: { user: true } }, messages: true },
    });
  }

  async getUserConversations(userId: string, organizationId: string) {
    return prisma.conversation.findMany({
      where: {
        organizationId,
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: { user: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
    organizationId: string,
  ) {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.ownerId !== userId) {
      throw new ForbiddenException('Only the conversation owner can delete it');
    }

    await prisma.message.deleteMany({ where: { conversationId } });
    await prisma.conversationParticipant.deleteMany({
      where: { conversationId },
    });
    await prisma.conversation.delete({ where: { id: conversationId } });

    return conversationId;
  }

  async verifyParticipant(
    conversationId: string,
    userId: string,
    organizationId: string,
  ) {
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
        conversation: { organizationId },
      },
    });

    if (!participant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }
  }
}
