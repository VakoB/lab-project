import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    private dataSource: DataSource,
    @InjectRedis() private readonly redis: Redis,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async checkHealth() {
    const postgres = await this.checkPostgres();
    const redis = await this.checkRedis();
    const rabbitmq = this.checkRabbitMQ();

    return { postgres, redis, rabbitmq };
  }

  async checkPostgres() {
    try {
      await this.dataSource.query('SELECT 1');
      return 'UP';
    } catch {
      return 'DOWN';
    }
  }

  async checkRedis() {
    try {
      await this.redis.ping();
      return 'UP';
    } catch {
      return 'DOWN';
    }
  }

  checkRabbitMQ() {
    try {
      if (this.amqpConnection.managedConnection.isConnected()) {
        return 'UP';
      }
      return 'DOWN';
    } catch {
      return 'DOWN';
    }
  }
}
