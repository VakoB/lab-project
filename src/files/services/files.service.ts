import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClamAvService } from './clamav.service';
import { MinioService } from './minio.service';
import { validateFile } from '../file-validation.util';
import * as crypto from 'crypto';
import { prisma } from 'src/prisma/prisma.client';
import path from 'path';
import { handlePrismaError } from 'src/utils/prisma.error.handler';
import { fileTypeFromBuffer } from 'file-type';

@Injectable()
export class FilesService {
  constructor(
    private clamAvService: ClamAvService,
    private minioService: MinioService,
  ) {}

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    organizationId: string,
    uploadedById: string,
  ) {
    const file = await fileTypeFromBuffer(buffer);

    const detectedMimeType: string = file?.mime || mimeType;

    validateFile(originalName, detectedMimeType, buffer.length);

    await this.clamAvService.scanBuffer(buffer);

    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    const existing = await prisma.file.findFirst({
      where: { sha256, organizationId },
    });

    if (existing) {
      return new ConflictException(
        'File with the same content already exists in the organization',
      );
    }

    const ext = path.extname(originalName).toLowerCase();
    const storageKey = `${organizationId}/${sha256}${ext}`;

    await this.minioService.upload(storageKey, buffer, mimeType);

    try {
      return await prisma.file.create({
        data: {
          organizationId,
          uploadedById,
          originalName,
          storageKey,
          mimeType,
          size: buffer.length,
          sha256,
        },
      });
    } catch (error) {
      await this.minioService.delete(storageKey).catch(() => null);
      handlePrismaError(error);
    }
  }

  async list(
    organizationId: string,
    params?: { page?: number; limit?: number },
  ) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.file.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          size: true,
          createdAt: true,
          uploadedBy: { select: { username: true } },
        },
      }),
      prisma.file.count({ where: { organizationId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async download(fileId: string, organizationId: string) {
    const file = await this.findAndVerifyOrg(fileId, organizationId);
    const buffer = await this.minioService.download(file.storageKey);
    return { buffer, file };
  }

  async delete(fileId: string, organizationId: string) {
    const file = await this.findAndVerifyOrg(fileId, organizationId);

    await prisma.file.delete({
      where: { id: fileId },
    });

    await this.minioService.delete(file.storageKey);
  }

  private async findAndVerifyOrg(fileId: string, organizationId: string) {
    const file = await prisma.file.findFirst({
      where: { id: fileId },
    });

    if (!file) throw new NotFoundException(`File ${fileId} not found`);

    if (file.organizationId !== organizationId) {
      throw new ForbiddenException('Access denied');
    }

    return file;
  }
}
