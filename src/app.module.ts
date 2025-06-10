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
import { JRPCModule } from './modules/jrpc';
import { IncomingMessage } from 'http';
import { ServerResponse } from 'http';
import { GraphqlModule } from '@/graphql';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLJSON, GraphQLDateTime } from 'graphql-scalars';

const isApi = Boolean(Number(process.env.IS_API || 0));
const isJRpc = Boolean(Number(process.env.IS_JRPC || 0));
const isWS = Boolean(Number(process.env.IS_WS || 0));
const isGraphql = Boolean(Number(process.env.IS_GRAPHQL || 0));
const isVM = Boolean(Number(process.env.IS_VM || 0));
const isGameServer = Boolean(Number(process.env.IS_GAME_SERVER || 0));

let _modules = [];
if (isWS) {
  _modules = [..._modules, WebsocketModule];
}
if (isApi) {
  _modules = [..._modules, ApiModule];
}
if (isJRpc) {
  _modules = [..._modules, JRPCModule];
}
if (isGraphql) {
  _modules.push(
    // GraphQL configuration
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => {
        const isDevelopment = process.env.APP_ENV !== 'production';
        return {
          // autoSchemaFile: 'schema.gql',
          autoSchemaFile: true,
          playground: true,
          subscription: true,
          path: '/graphql',
          context: (request: any) => {
            return {
              user: request.user,
              headers: request.headers,
            };
          },
          buildSchemaOptions: {
            fieldMiddleware: [],
            dateScalarMode: 'isoDate',
            numberScalarMode: 'integer',
          },
          resolvers: {
            JSON: GraphQLJSON,
            DateTime: GraphQLDateTime,
          },
          errorFormatter: (execution) => {
            // Custom error formatter to prevent leaking internal errors
            if (!isDevelopment) {
              // In production, don't expose error details
              return {
                statusCode: 500,
                response: {
                  errors: execution.errors.map((err) => ({
                    message: 'Internal server error',
                    locations: err.locations,
                    path: err.path,
                  })),
                },
              };
            }
            // In development, show the full error
            return {
              statusCode: 500,
              response: execution,
            };
          },
          security: {
            maxDepth: 7, // Limit query depth
            maxOperations: 10, // Limit batch operations
          },
        };
      },
      inject: [],
    }),
    GraphqlModule,
  );
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
        genReqId: () => crypto.randomUUID(),
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
          },
        },
        serializers: {
          req(request: IncomingMessage) {
            return {
              method: request.method,
              url: request.url,
            };
          },
          res(reply: ServerResponse) {
            return {
              statusCode: reply.statusCode,
            };
          },
        },
        customProps: () => ({
          context: 'HTTP',
        }),
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
