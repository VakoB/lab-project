import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { RagServiceModule } from './rag-service.module';
import {
  RAG_QUEUE,
  RAG_DLX,
  RAG_DEAD_ROUTING_KEY,
} from '../../../libs/shared/rabbitmq/rag.constants';
import * as amqp from 'amqplib';

async function dlqSetup() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
  );
  const channel = await connection.createChannel();
  await channel.assertExchange(RAG_DLX, 'direct', { durable: true });
  await channel.assertQueue('rag_document_processing_queue_dlq', {
    durable: true,
  });
  await channel.bindQueue(
    'rag_document_processing_queue_dlq',
    RAG_DLX,
    RAG_DEAD_ROUTING_KEY,
  );

  await channel.assertQueue(RAG_QUEUE, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': RAG_DLX,
      'x-dead-letter-routing-key': RAG_DEAD_ROUTING_KEY,
    },
  });

  await channel.close();
  await connection.close();
}

async function bootstrap() {
  await dlqSetup();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RagServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672'],
        queue: RAG_QUEUE,
        queueOptions: {
          durable: true,
          arguments: {
            'x-dead-letter-exchange': RAG_DLX,
            'x-dead-letter-routing-key': RAG_DEAD_ROUTING_KEY,
          },
        },
        noAck: false,
      },
    },
  );
  await app.listen();
}

bootstrap().catch((error) => {
  console.error('Failed to start Rag Service:', error);
  process.exit(1);
});
