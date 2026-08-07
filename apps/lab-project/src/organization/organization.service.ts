import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma/prisma.client';
import { handlePrismaError } from '../utils/prisma.error.handler';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { plainToInstance } from 'class-transformer';
import { OrganizationEntity } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  async create(data: CreateOrganizationDto) {
    try {
      const organization = await prisma.organization.create({ data });
      return plainToInstance(OrganizationEntity, organization, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findById(id: string) {
    const organization = await prisma.organization.findFirst({
      where: { id, deletedAt: null },
    });
    if (!organization)
      throw new NotFoundException(`Organization ${id} not found`);
    return plainToInstance(OrganizationEntity, organization, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, data: UpdateOrganizationDto) {
    await this.findById(id);
    try {
      const updatedOrganization = await prisma.organization.update({
        where: { id },
        data,
      });
      return plainToInstance(OrganizationEntity, updatedOrganization, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.findById(id);
    try {
      await prisma.organization.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const organizations = await prisma.organization.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      return plainToInstance(OrganizationEntity, organizations, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
