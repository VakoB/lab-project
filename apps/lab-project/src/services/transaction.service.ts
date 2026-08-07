import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';

@Injectable()
export class TransactionService {
  async createConversationWithFirstMessage(
    ownerId: string,
    title: string,
    messageContent: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          ownerId,
          title,
        },
      });

      const message = await tx.message.create({
        data: {
          content: messageContent,
          conversationId: conversation.id,
          senderId: ownerId,
        },
      });

      return {
        conversation,
        message,
      };
    });
  }

  async deleteOrganization(organizationId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.session.deleteMany({
        where: {
          user: {
            organizationId,
          },
        },
      });

      const org = await tx.organization.update({
        where: { id: organizationId },
        data: {
          deletedAt: new Date(),
        },
      });

      return org;
    });
  }

  async testRollback(ownerId: string, title: string) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.conversation.create({
          data: {
            ownerId,
            title,
          },
        });

        throw new Error('Intentional error');
      });
    } catch {
      console.log('Rollbacked');
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        title,
      },
    });

    return conversation;
  }
}
