import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  async create(data: CreateUserDto) {
    try {
      const { password, ...userData } = data;

      const passwordHash = password;
      const createdUser = await prisma.user.create({
        data: { ...userData, passwordHash },
        select: { id: true, username: true, email: true, organizationId: true },
      });
      return plainToInstance(UserEntity, createdUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { organization: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const serializedUser = plainToInstance(UserEntity, user, {
      excludeExtraneousValues: true,
    });
    return serializedUser;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findById(id);
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data,
      });
      return plainToInstance(UserEntity, updatedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    try {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(take: number = 20, cursor?: string) {
    try {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        take,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      const nextCursor =
        users.length === take ? users[users.length - 1].id : null;

      const serializedUsers = plainToInstance(UserEntity, users, {
        excludeExtraneousValues: true,
      });

      return {
        data: serializedUsers,
        nextCursor,
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
