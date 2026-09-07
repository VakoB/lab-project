import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { prisma } from '../../prisma/prisma.client';
import {
  FILE_PROCESS_PATTERN,
  ProcessFileMessage,
} from '../messages/process-file.message';

@Injectable()
export class FileProcessingService {
  private readonly logger = new Logger(FileProcessingService.name);

  constructor(@Inject('RABBITMQ_CLIENT') private rabbitClient: ClientProxy) {}

  async enqueueProcessing(
    fileId: string,
    storagePath: string,
    organizationId: string,
  ) {
    const existingJob = await prisma.fileProcessingJob.findUnique({
      where: { fileId },
    });

    if (existingJob) {
      if (existingJob.status === 'COMPLETED') {
        throw new ConflictException('File already processed');
      }
      if (
        existingJob.status === 'PENDING' ||
        existingJob.status === 'PROCESSING'
      ) {
        throw new ConflictException('File is already being processed');
      }
      if (existingJob.status === 'FAILED') {
        return this.resetAndRequeue(
          existingJob.id,
          fileId,
          storagePath,
          organizationId,
        );
      }
    }

    return this.createAndPublish(fileId, storagePath, organizationId);
  }

  private async createAndPublish(
    fileId: string,
    storagePath: string,
    organizationId: string,
  ) {
    const correlationId = randomUUID();

    const job = await prisma.fileProcessingJob.create({
      data: { fileId, organizationId, correlationId, status: 'PENDING' },
    });

    const message: ProcessFileMessage = {
      jobId: job.id,
      fileId,
      storagePath,
      organizationId,
      correlationId,
    };

    this.rabbitClient.emit(FILE_PROCESS_PATTERN, message);
    this.logger.log(
      `Job enqueued: ${job.id} [correlationId: ${correlationId}]`,
    );

    return { jobId: job.id, correlationId, status: 'PENDING' };
  }

  private async resetAndRequeue(
    jobId: string,
    fileId: string,
    storagePath: string,
    organizationId: string,
  ) {
    const correlationId = randomUUID();

    await prisma.fileProcessingJob.update({
      where: { id: jobId },
      data: {
        status: 'PENDING',
        retryCount: 0,
        errorMessage: null,
        correlationId,
      },
    });

    const message: ProcessFileMessage = {
      jobId,
      fileId,
      storagePath,
      organizationId,
      correlationId,
    };

    this.rabbitClient.emit(FILE_PROCESS_PATTERN, message);
    this.logger.log(`Job requeued: ${jobId} [correlationId: ${correlationId}]`);

    return { jobId, correlationId, status: 'PENDING' };
  }

  async getJobStatus(jobId: string, organizationId: string) {
    const job = await prisma.fileProcessingJob.findFirst({
      where: { id: jobId, organizationId },
      include: { result: true },
    });

    if (!job) throw new NotFoundException(`Job ${jobId} not found`);
    return job;
  }
}
