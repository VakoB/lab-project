import { Module } from '@nestjs/common';
import { ProcessingService } from './processing.service';
import { ProcessingController } from './processing.controller';
import { QdrantService } from '../qdrant/qdrant.service';
import { ChunkingService } from './chunking.service';
import { ParsingService } from './parsing.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { MinioService } from '../minio/minio.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'CORE_EVENTS',
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
            ],
            queue: 'rag_core_events_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [ProcessingController],
  providers: [
    ProcessingService,
    QdrantService,
    ChunkingService,
    ParsingService,
    EmbeddingsService,
    MinioService,
  ],
})
export class FileProcessingModule {}
