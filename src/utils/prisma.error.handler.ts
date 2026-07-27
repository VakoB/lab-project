import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target =
          (error.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
        throw new ConflictException(`Duplicate value for ${target}`);
      }
      case 'P2025':
        throw new NotFoundException('Record not found');

      case 'P2003': {
        const field =
          (error.meta?.field_name as string | undefined) ?? 'related record';
        throw new BadRequestException(`Invalid reference for ${field}`);
      }
      default:
        throw new InternalServerErrorException(`Database error`);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException(`Invalid query input`);
  }

  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    throw new InternalServerErrorException(`Database connection failure`);
  }

  throw error;
}
