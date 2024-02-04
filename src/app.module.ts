import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { ApiModule } from '@/api';
import { TimescaleDBModule } from '@/timescale-db';
import { WebsocketModule } from '@/websocket';
import { BlockchainModule } from './modules/blockchain';
import { TelegramBotModule } from './modules/telegram-bot';
import { ListenSocketModule } from '@/modules/listen-socket/listen-socket.module';

const isApi = Boolean(Number(process.env.IS_API || 0));
const isWS = Boolean(Number(process.env.IS_WS || 0));
const isVM = Boolean(Number(process.env.IS_VM || 0));

let _modules = [];
if (isWS) {
  _modules = [..._modules, WebsocketModule];
}
if (isApi) {
  _modules = [..._modules, ApiModule];
}
if (isVM) {
  _modules = [
    ..._modules,
    ListenSocketModule,
    // TelegramBotModule, 
  ];
}
@Module({
  imports: [
    DatabaseModule,
    TimescaleDBModule,
    ..._modules
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
