import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import morgan from 'morgan';
import { GCPubSubServer } from 'nestjs-google-pubsub-microservice';
import { RedisIoAdapter } from './modules/websocket/services/redis.adapter';

// const DEFAULT_API_VERSION = '1';
const PORT = process.env.PORT || '3000';
const isWS = Boolean(Number(process.env.IS_WS || 0));
const isApi = Boolean(Number(process.env.IS_API || 0));
const isVM = Boolean(Number(process.env.IS_VM || 0));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (isWS || isVM) {
    // const randomCode = uuidv4();
    const randomCode = Date.now();
    app.connectMicroservice({
      strategy: new GCPubSubServer({
        topic: process.env.GC_PUBSUB_TOPIC || 'default_topic',
        subscription: `${process.env.GC_PUBSUB_SUBSCRIPTION || 'app-server-pubsub'}${isVM ? '' : `-${randomCode}`
          }`,
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

  if(isWS){
    // const redisIoAdapter = new RedisIoAdapter(app);
    // await redisIoAdapter.connectToRedis();
    // app.useWebSocketAdapter(redisIoAdapter);
  }

  if (isApi) {

    const corsOrigin = process.env.CORS_ORIGIN.split(',') || [
      'http://localhost:3000',
    ];

    app.enableCors({
      // allowedHeaders: ['content-type'],
      // origin: corsOrigin,
      // credentials: true,
    });

    app.use(morgan('tiny'));
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // app.useStaticAssets(join(__dirname, '.', 'public'));
    // app.setBaseViewsDir(join(__dirname, '.', 'views'));
    // app.setViewEngine('pub');
    if (process.env.APP_ENV !== 'production') {
      const options = new DocumentBuilder()
        .setTitle('API docs')
        // .setVersion(DEFAULT_API_VERSION)
        .addBearerAuth()
        .build();

      // const globalPrefix = 'docs';
      // app.setGlobalPrefix(globalPrefix);
      // app.enableVersioning({
      //   defaultVersion: DEFAULT_API_VERSION,
      //   type: VersioningType.URI,
      // });

      const document = SwaggerModule.createDocument(app, options);
      SwaggerModule.setup('docs', app, document);
    }
    await app.listen(PORT);
    Logger.log(`🚀 Application is running in port ${PORT}`);
  } else {
    await app.init();
  }
}
bootstrap();
