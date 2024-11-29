import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import {
  AssistantController,
  AuthController,
  NotificationController,
} from '@/api/controllers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppFirestoreRepository, FirebaseModule } from '@/modules/firebase';
import { configCache, configFirebase } from '@/modules/api/configs';
import { HealthController } from './controllers/health.controller';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { TimescaleDBModule } from '@/modules/timescale-db';
import { UploadFileModule } from '../upload-file/upload-file.module';
import { QueueService } from '../queue/queue.service';
import { QueueModule } from '../queue/queue.module';
import { configAuth } from './configs/auth';
import { JwtModule } from '@nestjs/jwt';
import { AiModule } from '../ai/ai.module';
import { redisStore } from 'cache-manager-redis-store';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { ElasticSearchModule } from '@/elasticsearch/elasticsearch.module';
import { TransporterModule } from '@/transporter/transporter.module';
import { TelegramBotModule } from '../telegram-bot';
import { FormatResponseInterceptor } from './interceptors';
import {
  ValidateCodeUppercase,
  ValidateQuestContent,
} from './dtos/demo-validator.dto';
import { RabbitMQService } from '../transporter/services';
import { BusinessModule } from '@/business/business.module';
import { WorkerThreadModule } from '@/worker-thread/worker-thread.module';
import {
  AllExceptionsFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
  NotFoundExceptionFilter,
  UnauthorizedExceptionFilter,
  ValidationExceptionFilter,
} from './filters';

const validators = [ValidateCodeUppercase, ValidateQuestContent];
@Module({
  imports: [
    DatabaseModule,
    TimescaleDBModule,
    QueueModule,
    UploadFileModule,
    AiModule,
    ElasticSearchModule,
    TransporterModule,
    TelegramBotModule,
    BusinessModule,
    WorkerThreadModule,
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
      load: [configFirebase, configCache, configAuth],
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
    ...validators,
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomThrottlerGuard,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: FormatResponseInterceptor,
    // },
    {
      provide: APP_FILTER,
      useFactory: () => {
        return new AllExceptionsFilter(
          process.env.APP_ENV !== 'production',
          false,
        );
      },
    },
    { provide: APP_FILTER, useClass: ValidationExceptionFilter },
    { provide: APP_FILTER, useClass: BadRequestExceptionFilter },
    { provide: APP_FILTER, useClass: UnauthorizedExceptionFilter },
    { provide: APP_FILTER, useClass: ForbiddenExceptionFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
  ],
})
export class ApiModule implements OnApplicationBootstrap {
  constructor(
    @Inject('APP_FIRESTORE')
    private appFirestoreRepository: AppFirestoreRepository,

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
    // const m = await this.rabbitMQService.send('TEST_MQ_EVENT', {
    //   test: 1,
    // });
    // this.rabbitMQService.send('TEST_MQ_EVENT', {
    //   test: 2,
    // });
  }
}
