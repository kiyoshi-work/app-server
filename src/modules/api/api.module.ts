import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import {
  AssistantController,
  AuthController,
  NotificationController,
} from '@/api/controllers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '@/api/services';
import { LoggerModule } from '@/logger';
import { AppFirestoreRepository, FirebaseModule } from '@/modules/firebase';
import { configCache, configFirebase } from '@/modules/api/configs';
import { OnesignalModule } from '../onesignal/onesignal.module';
import { NotificationService } from './services/notification.service';
import { HealthController } from './controllers/health.controller';
import { Notification } from '@/onesignal/http/v1/notification';
import { EventModule } from '@/modules/event/event.module';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { TimescaleDBModule } from '@/modules/timescale-db';
import { UploadFileModule } from '../upload-file/upload-file.module';
import { QueueService } from '../queue/queue.service';
import { QueueModule } from '../queue/queue.module';
import { configAuth } from './configs/auth';
import { JwtModule } from '@nestjs/jwt';
import { AiModule } from '../ai/ai.module';
import { redisStore } from 'cache-manager-redis-store';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { configTwitterAuth } from './configs/twitter-auth';
import { ElasticSearchModule } from '@/elasticsearch/elasticsearch.module';
import { TransporterModule } from '@/transporter/transporter.module';
import { TelegramBotModule } from '../telegram-bot';
import { FormatResponseInterceptor } from './interceptors';
import {
  ValidateCodeUppercase,
  ValidateQuestContent,
} from './dtos/demo-validator.dto';
import { RabbitMQService } from '../transporter/services';

const services = [AuthService, NotificationService];
const validators = [ValidateCodeUppercase, ValidateQuestContent];
@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    OnesignalModule,
    EventModule,
    TimescaleDBModule,
    QueueModule,
    UploadFileModule,
    AiModule,
    ElasticSearchModule,
    TransporterModule,
    TelegramBotModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: process.env.APP_ENV === 'production' ? 60 : 600,
    }),
    FirebaseModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('firebase'),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configFirebase, configCache, configAuth, configTwitterAuth],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.key.jwt_secret_key'),
        global: true,
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const urlRedis = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DATABASE}`;
        return {
          ttl: Number(configService.get('cache.api.cache_ttl')),
          store: (await redisStore({
            url: urlRedis,
            ttl: Number(configService.get('cache.api.cache_ttl')) / 1000,
          })) as unknown as CacheStore,
        };
      },
    }),
  ],
  controllers: [
    AuthController,
    NotificationController,
    HealthController,
    AssistantController,
  ],
  providers: [
    ...services,
    ...validators,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: FormatResponseInterceptor,
    },
  ],
})
export class ApiModule implements OnApplicationBootstrap {
  constructor(
    @Inject('APP_FIRESTORE')
    private appFirestoreRepository: AppFirestoreRepository,
    private readonly oneSignalNotification: Notification,

    @Inject(QueueService)
    private queueService: QueueService,
    private rabbitMQService: RabbitMQService,
  ) {}

  async onApplicationBootstrap() {
    // await this.queueService.testUserQueue(3000);
    // await this.queueService.testUserQueue(1000);
    // await sleep(2000);
    // await this.queueService.testLock1(3000);
    // await this.queueService.testLock2(1000);
    // await this.queueService.testFail(4);
    // await this.appFirestoreRepository.test();
    // await this.oneSignalNotification.sendToAll({
    //   title: 'testnoti',
    //   launchUrl: '/ccccc',
    //   content: 'casca',
    //   onesignalAppId: '611f78ab-1f2b-40e0-9e7b-c5eef7ce8ca0',
    //   onesignalApiKey: 'YzE4NmRmNDUtY2NkOC00OGVkLWIxODktNTk3YTgxM2FhYmJm',
    // });
    // const m = await this.rabbitMQService.send('TEST_MQ_EVENT', {
    //   test: 1,
    // });
    // this.rabbitMQService.send('TEST_MQ_EVENT', {
    //   test: 2,
    // });
  }
}
