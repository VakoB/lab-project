import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FilesController } from './files.controller';
import { FilesService } from './services/files.service';
import { FileProcessingService } from './services/file-processing.service';
import { MinioService } from './services/minio.service';
import { ClamAvService } from './services/clamav.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
          ],
          exchange: 'file.direct',
          exchangeType: 'direct',
          routingKey: 'file.process',
          queue: process.env.RABBITMQ_QUEUE ?? 'file-processing',
          queueOptions: {
            durable: true,
            deadLetterExchange: '',
            deadLetterRoutingKey:
              process.env.RABBITMQ_DLQ ?? 'file-processing-failed',
          },
        },
      },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService, FileProcessingService, MinioService, ClamAvService],
})
export class FilesModule {}
