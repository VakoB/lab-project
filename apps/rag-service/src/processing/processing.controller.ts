import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ProcessingService } from './processing.service';
import type { FileProcessingMessage } from 'apps/rag-service/messages/file-processing.message';
import { Channel, Message } from 'amqplib';

@Controller()
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  @EventPattern('rag.document.process')
  async handleDocumentProcess(
    @Payload() data: FileProcessingMessage,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef() as Channel;
    const originalMsg = context.getMessage() as Message;
    try {
      await this.processingService.process(data);
      channel.ack(originalMsg);
    } catch (err) {
      channel.nack(originalMsg, false, false);
      throw err;
    }
  }
}
