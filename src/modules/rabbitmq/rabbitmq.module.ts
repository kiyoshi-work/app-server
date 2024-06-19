import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { configRabbitMq } from './configs/rabbitmq.config';
import { RabbitMQService } from './rabbitmq.service';

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
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
