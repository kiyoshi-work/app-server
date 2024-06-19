import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { ApiModule } from '@/api';
import { TimescaleDBModule } from '@/timescale-db';
import { WebsocketModule } from '@/websocket';
import { TelegramBotModule } from './modules/telegram-bot';
import { ListenSocketModule } from '@/modules/listen-socket/listen-socket.module';
import { SyncContractModule } from '@/modules/sync-contract/sync-contract.module';
import { WorkerModule } from './modules/worker/worker.module';
import { VectorStoreModule } from './modules/vectorstore-db/vector-store.module';
import { AiModule } from '@/modules/ai/ai.module';
import { SentryModule } from '@/modules/sentry/sentry.module';
import * as Sentry from '@sentry/node';
import { MilvusModule } from './modules/milvus-db/milvus.module';
import { CrawlerModule } from './modules/crawler/crawler.module';

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
    SyncContractModule,
    WorkerModule,
    AiModule,
    // TelegramBotModule,
  ];
}

if (process.env.APP_ENV) {
  _modules = [
    ..._modules,
    // SentryModule.forRoot({
    //   dsn: process.env.SENTRY_DNS,
    //   environment: process.env.APP_ENV || 'local',
    //   // Performance Monitoring
    //   tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // }),
  ];
}
@Module({
  imports: [
    DatabaseModule,
    TimescaleDBModule,
    VectorStoreModule,
    MilvusModule,
    CrawlerModule,
    ..._modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer): void {
  //   if (process.env.APP_ENV) {
  //     consumer.apply(Sentry.Handlers.requestHandler()).forRoutes({
  //       path: '*',
  //       method: RequestMethod.ALL,
  //     });
  //   }
  // }
}
