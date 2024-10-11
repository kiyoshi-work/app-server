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
import { GameModule } from './modules/game/game.module';
import { LoggerModule } from 'nestjs-pino';
import { ResilienceModule } from 'nestjs-resilience';

const isApi = Boolean(Number(process.env.IS_API || 0));
const isWS = Boolean(Number(process.env.IS_WS || 0));
const isVM = Boolean(Number(process.env.IS_VM || 0));
const isGameServer = Boolean(Number(process.env.IS_GAME_SERVER || 0));

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
    TelegramBotModule,
  ];
}

if (isGameServer) {
  _modules = [..._modules, GameModule];
}

if (process.env.APP_ENV) {
  _modules = [
    ..._modules,
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DNS,
      environment: process.env.APP_ENV || 'local',
      // Performance Monitoring
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
    }),
  ];
}
@Module({
  imports: [
    DatabaseModule,
    TimescaleDBModule,
    VectorStoreModule,
    MilvusModule,
    CrawlerModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.APP_ENV === 'production' ? 'info' : 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            ignore: 'pid,hostname',
            messageFormat: '{msg}',
            translateTime: 'SYS:standard',
          },
        },
        // serializers: {
        //   req: () => undefined,
        //   res: () => undefined,
        // },
        customProps: (req, res) => ({
          context: 'HTTP',
        }),
        customSuccessMessage: (req, res) => {
          if (req && res) {
            return `${req.method} ${req.url}`;
          }
          return 'Request completed';
        },
        customErrorMessage: (req, res, error) => {
          if (req) {
            return `${req.method} ${req.url} failed with error: ${error.message}`;
          }
          return 'Request failed';
        },
      },
      exclude: [{ method: RequestMethod.ALL, path: 'health' }],
    }),
    ResilienceModule.forRoot({}),
    ..._modules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    if (process.env.APP_ENV) {
      consumer.apply(Sentry.Handlers.requestHandler()).forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
    }
  }
}
