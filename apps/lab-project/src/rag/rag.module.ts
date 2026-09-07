import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { FilesService } from '../files/services/files.service';
import { ClamAvService } from '../files/services/clamav.service';
import { MinioService } from '../files/services/minio.service';
import { JwtModule } from '@nestjs/jwt';
import { RagGateway } from './rag.gateway';
import { RagEventsController } from './rag-events.controller';

const RAG_QUEUE = 'rag_document_processing_queue';
const RAG_DLX = 'rag_dlx';
const RAG_DEAD_ROUTING_KEY = 'rag.document.process.dead';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RAG_SERVICE',
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
            ],
            queue: RAG_QUEUE,
            queueOptions: {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': RAG_DLX,
                'x-dead-letter-routing-key': RAG_DEAD_ROUTING_KEY,
              },
            },
          },
        }),
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [RagController, RagEventsController],
  providers: [
    RagService,
    FilesService,
    ClamAvService,
    MinioService,
    RagGateway,
  ],
})
export class RagModule {}
