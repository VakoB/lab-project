import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';

describe('AppService', () => {
  let service: AppService;

  const mockDataSource = {
    query: jest.fn(),
  };

  const mockRedis = {
    ping: jest.fn(),
  };

  const mockAmqpConnection = {
    managedConnection: {
      isConnected: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: getRedisConnectionToken(), useValue: mockRedis },
        { provide: AmqpConnection, useValue: mockAmqpConnection },
      ],
    }).compile();

    service = module.get<AppService>(AppService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct health status', async () => {
    mockDataSource.query.mockResolvedValue([]);
    mockRedis.ping.mockResolvedValue('PONG');
    mockAmqpConnection.managedConnection.isConnected.mockReturnValue(true);

    const result = await service.checkHealth();

    expect(result).toEqual({
      postgres: 'UP',
      redis: 'UP',
      rabbitmq: 'UP',
    });
  });
});
