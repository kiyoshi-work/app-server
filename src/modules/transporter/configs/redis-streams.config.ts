import { registerAs } from '@nestjs/config';

export const configRedisStreams = registerAs('redis_streams', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DATABASE) || 0,
  consumerGroup: process.env.REDIS_CONSUMER_GROUP || 'nestjs-group',
  consumerName: process.env.REDIS_CONSUMER_NAME || 'nestjs-consumer',
  maxLen: Number(process.env.REDIS_STREAM_MAX_LEN) || 1000,
  blockTime: Number(process.env.REDIS_STREAM_BLOCK_TIME) || 1000,
}));


