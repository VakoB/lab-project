import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WorkerModule } from './worker.module';
import * as amqp from 'amqplib';

async function setupQueues() {
  const connection = await amqp.connect(
    process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
  );
  const channel = await connection.createChannel();

  await channel.assertExchange('file.direct', 'direct', { durable: true });

  await channel.assertQueue('file-processing', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': '',
      'x-dead-letter-routing-key': 'file-processing-failed',
    },
  });
  await channel.assertQueue('file-processing-failed', { durable: true });

  await channel.bindQueue('file-processing', 'file.direct', 'file.process');

  await channel.close();
  await connection.close();

  console.log('Exchange, queues and bindings set up');
}

async function bootstrap() {
  await setupQueues();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672'],
        queue: process.env.RABBITMQ_QUEUE ?? 'file-processing',
        queueOptions: {
          durable: true,
          deadLetterExchange: '',
          deadLetterRoutingKey:
            process.env.RABBITMQ_DLQ ?? 'file-processing-failed',
        },
        noAck: false,
        prefetchCount: 1,
      },
    },
  );
  await app.listen();
  console.log('Worker is listening to messages');
}

bootstrap().catch((error) => {
  console.error('Failed to start the microservice:', error);
  process.exit(1);
});
