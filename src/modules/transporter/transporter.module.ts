import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { configRabbitMq } from './configs/rabbitmq.config';
import { RabbitMQService, RedisMQService } from './services';

// https://github.com/jmaicaaan/tutorial-nestjs-rabbitmq
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configRabbitMq],
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
  ],
  providers: [RabbitMQService, RedisMQService],
  exports: [RabbitMQService, RedisMQService],
})
export class TransporterModule {}
