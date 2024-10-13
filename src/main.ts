import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { GCPubSubServer } from 'nestjs-google-pubsub-microservice';
import { RedisIoAdapter } from './modules/websocket/services/redis.adapter';
import { GlobalExceptionFilter } from './modules/api/filters/GlobalExceptionFilter';
import { RedisOptions, RmqOptions, Transport } from '@nestjs/microservices';
import { GameService } from '@/game/game.service';
import { playground } from '@colyseus/playground';
import { monitor } from '@colyseus/monitor';
import { useContainer } from 'class-validator';
import { Logger as PinoLogger } from 'nestjs-pino';

// const DEFAULT_API_VERSION = '1';
const PORT = process.env.PORT || '3000';
const GAMESERVER_PORT = Number(process.env.GAMESERVER_PORT || '3000');

const isGameServer = Boolean(Number(process.env.IS_GAME_SERVER || 0));
const isWS = Boolean(Number(process.env.IS_WS || 0));
const isApi = Boolean(Number(process.env.IS_API || 0));
const isVM = Boolean(Number(process.env.IS_VM || 0));

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
    bufferLogs: true,
  });
  app.useLogger(app.get(PinoLogger));
  if (isWS) {
    // NOTE: redisadapter for socket
    // const redisIoAdapter = new RedisIoAdapter(app);
    // await redisIoAdapter.connectToRedis();
    // app.useWebSocketAdapter(redisIoAdapter);
    // NOTE: Pickone for transport
    app.connectMicroservice<RmqOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABITTMQ_URL],
        queue: 'rabbit-mq-queue',
        prefetchCount: 1,
        persistent: true,
        noAck: true,
        queueOptions: {
          durable: true,
        },
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
      },
    });
    app.connectMicroservice<RedisOptions>({
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        db: Number(process.env.REDIS_DATABASE),
      },
    });
  }

  if (isWS || isVM) {
    // const randomCode = uuidv4();
    const randomCode = Date.now();
    app.connectMicroservice({
      strategy: new GCPubSubServer({
        topic: process.env.GC_PUBSUB_TOPIC || 'default_topic',
        subscription: `${
          process.env.GC_PUBSUB_SUBSCRIPTION || 'app-server-pubsub'
        }${isVM ? '' : `-${randomCode}`}`,
        ...(!(
          process.env.APP_ENV == 'production' ||
          process.env.APP_ENV == 'staging' ||
          process.env.APP_ENV == 'develop'
        ) && {
          client: {
            projectId: process.env.GC_PROJECT_ID || 'app-server-pubsub',
            apiEndpoint:
              process.env.GC_PUBSUB_ENDPOINT || 'http://app-server-pubsub:8085',
          },
        }),
      }),
    });

    await app.startAllMicroservices();
  }

  if (isGameServer) {
    console.log('🚀 ~ bootstrap ~ isGameServer:', isGameServer);
    const gameServer = new GameService();
    gameServer.createServer(app.getHttpServer());
    gameServer.defineRooms();
    // gameServer.listen(GAMESERVER_PORT);

    if (process.env.APP_ENV !== 'production') {
      app.use('/game', playground);
    }
    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use('/colyseus', monitor());
  }

  if (isApi) {
    // TIP: to inject class-validator
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    const corsOrigin = process.env.CORS_ORIGIN.split(',') || [
      'http://localhost:3000',
    ];

    app.enableCors({
      // allowedHeaders: ['content-type'],
      // origin: corsOrigin,
      // credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new GlobalExceptionFilter(true, true));

    // app.useStaticAssets(join(__dirname, '.', 'public'));
    // app.setBaseViewsDir(join(__dirname, '.', 'views'));
    // app.setViewEngine('pub');
    if (process.env.APP_ENV !== 'production') {
      const options = new DocumentBuilder()
        .setTitle('API docs')
        // .setVersion(DEFAULT_API_VERSION)
        .addBearerAuth()
        .build();

      const globalPrefix = 'api';
      app.setGlobalPrefix(globalPrefix);
      // app.enableVersioning({
      //   defaultVersion: DEFAULT_API_VERSION,
      //   type: VersioningType.URI,
      // });

      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup('docs', app, document);
    }
    await app.listen(PORT);
    Logger.log(`🚀 Application is running in port ${PORT}`);
  } else if (isGameServer) {
    app.listen(GAMESERVER_PORT);
    Logger.log(`🚀 Gameserver is running in port ${GAMESERVER_PORT}`);
  } else {
    await app.init();
  }
}
bootstrap();
