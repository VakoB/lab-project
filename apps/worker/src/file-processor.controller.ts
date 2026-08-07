import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { FileProcessorService } from './file-processor.service';
import { FILE_PROCESS_PATTERN } from './messages/process-file.message';
import type { ProcessFileMessage } from './messages/process-file.message';
import { Channel, Message } from 'amqplib';

@Controller()
export class FileProcessorController {
  private readonly logger = new Logger(FileProcessorController.name);

  constructor(private fileProcessorService: FileProcessorService) {}

  @EventPattern(FILE_PROCESS_PATTERN)
  async handleFileProcess(
    @Payload() message: ProcessFileMessage,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMessage = context.getMessage() as Message;

    this.logger.log(
      `Received job: ${message.jobId} [correlationId: ${message.correlationId}]`,
    );

    try {
      await this.fileProcessorService.process(message);

      channel.ack(originalMessage);
      this.logger.log(`Job completed: ${message.jobId}`);
    } catch (error) {
      this.logger.error(`Job failed: ${message.jobId}`, error);

      const retryCount = await this.fileProcessorService.getRetryCount(
        message.jobId,
      );

      if (retryCount >= 3) {
        this.logger.error(
          `Job ${message.jobId} exceeded retries, sending to DLQ`,
        );
        channel.nack(originalMessage, false, false);
      } else {
        channel.nack(originalMessage, false, true);
      }
    }
  }
}
