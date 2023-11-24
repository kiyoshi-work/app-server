import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configQueue } from './configs';
import { QUEUE_NAME } from './constants';
import { UserConsumer } from './consumers';
import { QueueService } from './services/queue.service';
import process from 'process';
import { DatabaseModule } from '@/database';

const isQueue = Boolean(Number(process.env.IS_QUEUE || 0));

let consumers = [];

if (isQueue) {
  consumers = [UserConsumer];
}

@Module({
  imports: [
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory(config: ConfigService) {
        const host = config.get<string>('queue.host');
        const port = config.get<number>('queue.port');
        const db = config.get<number>('queue.database');
        const password = config.get<string>('queue.password');
        const tls = config.get('queue.tls');
        return {
          redis: {
            host: host,
            port: port,
            db: db,
            password: password,
            tls,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      {
        name: QUEUE_NAME.USER,
      },
      // {
      //   name: QUEUE_NAME.USER_ACTION,
      // },
    ),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configQueue],
    }),
  ],
  controllers: [],
  providers: [...consumers, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
