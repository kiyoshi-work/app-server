import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { ApiModule } from '@/api';
import { TimescaleDBModule } from '@/timescale-db';
import { WebsocketModule } from '@/websocket';
import { BlockchainModule } from './modules/blockchain';

const isVM = Boolean(Number(process.env.IS_VM || 0));

const vmModules = isVM ? [WebsocketModule, ApiModule] : [ApiModule];
@Module({
  imports: [BlockchainModule, DatabaseModule, TimescaleDBModule, ...vmModules],
  controllers: [],
  providers: [],
})
export class AppModule {}
