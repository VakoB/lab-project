import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { randomUUID, createHash } from 'crypto';
import type { File as PrismaFile } from 'generated/prisma/client';
import { FilesService } from '../files/services/files.service';
import { prisma } from '../prisma/prisma.client';
import { toRagDocumentDto } from './rag-mapper';

export interface AskQuestionResponse {
  answer: string;
  sources: {
    label: string;
    chunkIndex: number;
    text: string;
    score: number;
  }[];
}

@Injectable()
export class RagService {
  constructor(
    @Inject('RAG_SERVICE') private readonly ragClient: ClientProxy,
    private readonly filesService: FilesService,
  ) {}
  async listDocuments(
    organizationId: string,
    params?: { page?: number; limit?: number },
  ) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const jobs = await prisma.ragIngestionJob.findMany({
      where: { organizationId },
      distinct: ['fileId'],
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { file: true },
    });

    const total = await prisma.file.count({
      where: { organizationId, ragIngestionJobs: { some: {} } },
    });

    return {
      data: jobs.map(toRagDocumentDto),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async ingestFile(
    organizationId: string,
    uploadedById: string,
    upload: Express.Multer.File,
  ) {
    let file: PrismaFile | null | undefined = null;

    try {
      file = await this.filesService.upload(
        upload.buffer,
        upload.originalname,
        upload.mimetype,
        organizationId,
        uploadedById,
      );
    } catch (err) {
      if (!(err instanceof ConflictException)) throw err;

      file = await prisma.file.findFirst({
        where: {
          organizationId,
          sha256: createHash('sha256').update(upload.buffer).digest('hex'),
        },
      });
    }
    if (!file) {
      throw new ConflictException(
        'File upload failed and no existing matching file was found',
      );
    }

    const existingJob = await prisma.ragIngestionJob.findFirst({
      where: { fileId: file.id, status: 'COMPLETED' },
    });
    if (existingJob) {
      return { file, job: existingJob, reused: true };
    }

    const correlationId = randomUUID();
    const job = await prisma.ragIngestionJob.create({
      data: {
        fileId: file.id,
        organizationId,
        correlationId,
        status: 'PENDING',
      },
    });

    this.ragClient.emit('rag.document.process', {
      jobId: job.id,
      fileId: file.id,
      organizationId,
      correlationId,
      storageKey: file.storageKey,
      mimeType: file.mimeType,
    });

    const jobWithFile = await prisma.ragIngestionJob.findUniqueOrThrow({
      where: { id: job.id },
      include: { file: true },
    });

    return toRagDocumentDto(jobWithFile);
  }

  askQuestion(organizationId: string, fileId: string, question: string) {
    return firstValueFrom(
      this.ragClient.send<AskQuestionResponse>('rag.question.ask', {
        organizationId,
        fileId,
        question,
      }),
    );
  }
}
