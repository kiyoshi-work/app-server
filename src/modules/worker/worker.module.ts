import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configQueue } from './configs';
import { TelegramBotConsumer, UserConsumer } from './consumers';
import { DatabaseModule } from '@/database';
import { TelegramBotModule } from '../telegram-bot';
import { ScheduleService } from './schedulers/schedule.service';
import { ScheduleModule } from '@nestjs/schedule';

const isQueue = Boolean(Number(process.env.IS_QUEUE || 0));
const isScheduler = Boolean(Number(process.env.IS_SCHEDULER || 0));

let consumers = [];
let schedulers = [];

if (isQueue) {
  consumers = [UserConsumer, TelegramBotConsumer];
}
if (isScheduler) {
  schedulers = [ScheduleService];
}

@Module({
  imports: [
    DatabaseModule,
    TelegramBotModule,
    ScheduleModule.forRoot(),
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
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configQueue],
    }),
  ],
  controllers: [],
  providers: [...consumers, ...schedulers],
  exports: [],
})
export class WorkerModule {}
