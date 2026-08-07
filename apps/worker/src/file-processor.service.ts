import { Injectable, Logger } from '@nestjs/common';
import { prisma } from './prisma/prisma.client';
import { MinioService } from './minio.service';
import { ExcelParserService } from './excel-parser.service';
import { ProcessFileMessage } from './messages/process-file.message';

@Injectable()
export class FileProcessorService {
  private readonly logger = new Logger(FileProcessorService.name);

  constructor(
    private minioService: MinioService,
    private excelParser: ExcelParserService,
  ) {}

  async process(message: ProcessFileMessage): Promise<void> {
    const { jobId, storagePath, correlationId } = message;

    const job = await prisma.fileProcessingJob.findUnique({
      where: { id: jobId },
      include: { result: true },
    });

    if (!job) throw new Error(`Job ${jobId} not found`);

    if (job.status === 'COMPLETED') {
      this.logger.warn(
        `Job ${jobId} already completed, skipping [correlationId: ${correlationId}]`,
      );
      return;
    }

    await prisma.fileProcessingJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING' },
    });

    try {
      this.logger.log(`Downloading file: ${storagePath} [${correlationId}]`);
      const buffer = await this.minioService.download(storagePath);

      this.logger.log(`Parsing Excel [${correlationId}]`);
      const { totalQuantity, totalRevenue, rows } =
        this.excelParser.parse(buffer);

      await prisma.$transaction([
        prisma.processingResult.create({
          data: {
            jobId,
            totalQuantity,
            totalRevenue,
            rowsProcessed: rows.length,
          },
        }),
        prisma.fileProcessingJob.update({
          where: { id: jobId },
          data: { status: 'COMPLETED' },
        }),
      ]);

      this.logger.log(
        `Job ${jobId} completed: ${rows.length} rows, revenue ${totalRevenue} [${correlationId}]`,
      );
    } catch (error) {
      await prisma.fileProcessingJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          retryCount: { increment: 1 },
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  async getRetryCount(jobId: string): Promise<number> {
    const job = await prisma.fileProcessingJob.findUnique({
      where: { id: jobId },
      select: { retryCount: true },
    });
    return job?.retryCount ?? 0;
  }
}
