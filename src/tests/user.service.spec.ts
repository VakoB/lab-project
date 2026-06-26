/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { prisma } from '../prisma/prisma.client';

jest.mock('../prisma/prisma.client', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        id: '1',
        username: 'john',
        email: 'john@example.com',
        passwordHash: 'hashed',
        organizationId: 'org1',
        deletedAt: null,
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById('1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: '1',
          deletedAt: null,
        },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const input = {
        organizationId: 'org1',
        username: 'john',
        email: 'john@example.com',
        passwordHash: 'hashed',
      };

      const createdUser = {
        id: '1',
        ...input,
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await service.create(input);

      expect(result).toEqual(createdUser);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });
});
