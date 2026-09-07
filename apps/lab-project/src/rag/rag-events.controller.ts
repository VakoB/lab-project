import { Controller } from '@nestjs/common';
import { RagGateway } from './rag.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class RagEventsController {
  constructor(private readonly ragGateway: RagGateway) {}

  @EventPattern('rag.job.status')
  handle(
    @Payload()
    data: {
      jobId: string;
      fileId: string;
      organizationId: string;
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      chunkCount?: number;
      errorMessage?: string;
    },
  ) {
    this.ragGateway.notifyStatus(data.organizationId, data);
  }
}
