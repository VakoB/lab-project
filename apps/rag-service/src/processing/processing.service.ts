import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ParsingService } from './parsing.service';
import { ChunkingService } from './chunking.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { MinioService } from '../minio/minio.service';
import { prisma } from '../prisma/prisma.client';
import { FileProcessingMessage } from 'apps/rag-service/messages/file-processing.message';
import { randomUUID } from 'crypto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProcessingService {
  constructor(
    private readonly parsing: ParsingService,
    private readonly chunking: ChunkingService,
    private readonly embeddings: EmbeddingsService,
    private readonly qdrant: QdrantService,
    private readonly minio: MinioService,
    @Inject('CORE_EVENTS') private readonly coreEvents: ClientProxy,
  ) {}
  async process(data: FileProcessingMessage) {
    const job = await prisma.ragIngestionJob.findUnique({
      where: { id: data.jobId },
    });

    if (!job)
      throw new NotFoundException(
        `Ingestion job with ID ${data.jobId} not found`,
      );
    if (job.status === 'COMPLETED') return;
    if (job.status === 'PROCESSING') return;

    if (job.retryCount >= 3) {
      await this.updateStatus(
        data.jobId,
        data.fileId,
        data.organizationId,
        'FAILED',
        {
          errorMessage: 'Max retries exceeded',
        },
      );
      return;
    }

    await this.updateStatus(
      data.jobId,
      data.fileId,
      data.organizationId,
      'PROCESSING',
      {
        retryCount: { increment: 1 },
      },
    );

    try {
      const buffer = await this.minio.download(data.storageKey);
      const text = await this.parsing.extractText(buffer, data.mimeType);
      const chunks = this.chunking.chunk(text);
      const vectors = await this.embeddings.embedMany(
        chunks.map((c) => c.text),
      );
      const points = chunks.map((chunk, i) => ({
        id: randomUUID(),
        vector: vectors[i],
        payload: {
          fileId: data.fileId,
          organizationId: data.organizationId,
          chunkIndex: chunk.index,
          text: chunk.text,
        },
      }));
      await this.qdrant.upsertChunks(points);
      await this.updateStatus(
        data.jobId,
        data.fileId,
        data.organizationId,
        'COMPLETED',
        {
          chunkCount: chunks.length,
        },
      );
    } catch (err) {
      await this.updateStatus(
        data.jobId,
        data.fileId,
        data.organizationId,
        'FAILED',
        {
          errorMessage: String(err),
        },
      );
      throw err;
    }
  }

  private async updateStatus(
    jobId: string,
    fileId: string,
    organizationId: string,
    status: string,
    extra?: any,
  ) {
    await prisma.ragIngestionJob.update({
      where: { id: jobId },
      data: { status, ...extra },
    });
    this.coreEvents.emit('rag.job.status', {
      jobId,
      fileId,
      organizationId,
      status,
      ...extra,
    });
  }
}
