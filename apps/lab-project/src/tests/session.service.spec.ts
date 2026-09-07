import { NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { SessionService } from '../services/session.service';

jest.mock('../prisma/prisma.client', () => ({
  prisma: {
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { prisma } from '../prisma/prisma.client';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
    jest.clearAllMocks();
  });

  it('creates a session', async () => {
    const input = { userId: 'u1', token: 'tok', expiresAt: new Date() };
    (prisma.session.create as jest.Mock).mockResolvedValue({
      id: '1',
      ...input,
    });

    const result = await service.create(input);

    expect(result!.token).toBe('tok');
  });

  it('throws BadRequestException on invalid userId (P2003)', async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Foreign key constraint failed',
      {
        code: 'P2003',
        clientVersion: '7.0.0',
        meta: { field_name: 'userId' },
      },
    );
    (prisma.session.create as jest.Mock).mockRejectedValue(error);

    await expect(
      service.create({ userId: 'bad', token: 'x', expiresAt: new Date() }),
    ).rejects.toThrow();
  });

  it('throws NotFoundException when session is missing', async () => {
    (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
