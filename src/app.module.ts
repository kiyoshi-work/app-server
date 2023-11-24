import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { ApiModule } from '@/api';
import { TimescaleDBModule } from '@/timescale-db';
import { WebsocketModule } from '@/websocket';
import { BlockchainModule } from './modules/blockchain';
import { TelegramBotModule } from './modules/telegram-bot';

const isVM = Boolean(Number(process.env.IS_VM || 0));

const vmModules = isVM ? [WebsocketModule, ApiModule] : [ApiModule];
@Module({
  imports: [TelegramBotModule, DatabaseModule, TimescaleDBModule, ...vmModules],
  controllers: [],
  providers: [],
})
export class AppModule {}
