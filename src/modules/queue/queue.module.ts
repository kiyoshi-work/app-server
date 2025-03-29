import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configQueue } from './configs';
import { QueueService } from './queue.service';
import { QUEUE_NAME } from '@/shared/constants/queue';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';

@Module({
  imports: [
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
    BullModule.registerQueue({
      name: QUEUE_NAME.USER,
      // limiter: {
      //   max: 2,
      //   duration: 10000,
      // },
    }),
    BullBoardModule.forFeature({
      name: QUEUE_NAME.USER,
      adapter: BullAdapter,
    }),
    BullModule.registerQueue({
      name: QUEUE_NAME.TELEGRAM_BOT,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configQueue],
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
  ],
  controllers: [],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
