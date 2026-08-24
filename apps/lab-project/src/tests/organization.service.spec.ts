/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { OrganizationService } from '../organization/organization.service';

jest.mock('../prisma/prisma.client', () => ({
  prisma: {
    organization: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../prisma/prisma.client';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(() => {
    service = new OrganizationService();
    jest.clearAllMocks();
  });

  it('creates an organization', async () => {
    (prisma.organization.create as jest.Mock).mockResolvedValue({
      id: '1',
      name: 'Company',
    });

    const result = await service.create({ name: 'Company' });

    expect(prisma.organization.create).toHaveBeenCalledWith({
      data: { name: 'Company' },
    });
    expect(result!.name).toBe('Company');
  });

  it('throws NotFoundException when organization is missing', async () => {
    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
