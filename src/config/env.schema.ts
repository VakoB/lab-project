import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  RABBITMQ_HOST: z.string(),
  RABBITMQ_PORT: z.coerce.number(),
  RABBITMQ_USER: z.string(),
  RABBITMQ_PASSWORD: z.string(),
});
