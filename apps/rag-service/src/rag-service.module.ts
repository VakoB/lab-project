import { Module } from '@nestjs/common';
import { RagServiceController } from './rag-service.controller';
import { RagServiceService } from './rag-service.service';
import { GenerationModule } from './generation/generation.module';
import { FileProcessingModule } from './processing/processing.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    GenerationModule,
    FileProcessingModule,
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
  controllers: [RagServiceController],
  providers: [RagServiceService],
})
export class RagServiceModule {}
