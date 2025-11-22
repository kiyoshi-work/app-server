import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisStreamsClientModule } from '@stijlbreuk/nestjs-redis-streams-transport';
import { configRabbitMq } from './configs/rabbitmq.config';
import {
  RabbitMQService,
  RedisMQService,
  RedisStreamsService,
} from './services';
import { configGCPubSub } from './configs/gcpubsub.config';
import { GCPubSubService } from './services/google-pubsub.service';
import { configRedisStreams } from './configs/redis-streams.config';

// https://github.com/jmaicaaan/tutorial-nestjs-rabbitmq
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configRabbitMq, configGCPubSub, configRedisStreams],
    }),
    ClientsModule.register([
      {
        name: 'RABBITMQ_MODULE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABITTMQ_URL],
          queue: 'rabbit-mq-queue',
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'REDISMQ_MODULE',
        transport: Transport.REDIS,
        options: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD,
          db: Number(process.env.REDIS_DATABASE),
        },
      },
    ]),
    RedisStreamsClientModule.register({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DATABASE),
    }),
  ],
  providers: [
    RabbitMQService,
    RedisMQService,
    GCPubSubService,
    RedisStreamsService,
  ],
  exports: [
    RabbitMQService,
    RedisMQService,
    GCPubSubService,
    RedisStreamsService,
  ],
})
export class TransporterModule {}
