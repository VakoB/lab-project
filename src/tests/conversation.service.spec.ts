import { NotFoundException } from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';

jest.mock('../prisma/prisma.client', () => ({
  prisma: {
    conversation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prisma } from '../prisma/prisma.client';

describe('ConversationService', () => {
  let service: ConversationService;

  beforeEach(() => {
    service = new ConversationService();
    jest.clearAllMocks();
  });

  it('creates a conversation', async () => {
    const input = { ownerId: 'u1', title: 'Hello' };
    (prisma.conversation.create as jest.Mock).mockResolvedValue({
      id: '1',
      ...input,
    });

    const result = await service.create(input);

    expect(result!.title).toBe('Hello');
  });

  it('throws NotFoundException when conversation is missing', async () => {
    (prisma.conversation.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updates the title', async () => {
    (prisma.conversation.update as jest.Mock).mockResolvedValue({
      id: '1',
      title: 'Updated',
    });

    const result = await service.update('1', { title: 'Updated' });

    expect(result!.title).toBe('Updated');
  });
});
