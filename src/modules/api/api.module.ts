import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { AuthController, NotificationController } from '@/api/controllers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '@/api/services';
import { LoggerModule } from '@/logger';
import { FirebaseModule, Goal3Firestore } from '@/modules/firebase';
import { configCache, configFirebase } from '@/modules/api/configs';
import { SyncUserGoal3Service } from './services/sync-user-goal3.service';
import { OnesignalModule } from '../onesignal/onesignal.module';
import { NotificationService } from './services/notification.service';
import { HealthController } from './controllers/health.controller';
import { Notification } from '@/onesignal/http/v1/notification';
import { EventModule } from '@/modules/event/event.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { SegmentService } from './services/segment.service';
import { SegmentController } from './controllers/segment.controller';
import { TimescaleDBModule } from '@/modules/timescale-db';
import { QueueModule } from '@/queue/queue.module';
import { QueueService } from '@/queue/services/queue.service';
import { UploadFileModule } from '../upload-file/upload-file.module';

const services = [
  SyncUserGoal3Service,
  AuthService,
  NotificationService,
  SegmentService,
];
@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    OnesignalModule,
    EventModule,
    TimescaleDBModule,
    QueueModule,
    UploadFileModule,
    ScheduleModule.forRoot(),
    FirebaseModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('firebase'),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configFirebase, configCache],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('cache.api.cache_ttl'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    NotificationController,
    HealthController,
    SegmentController,
  ],
  providers: [...services],
})
export class ApiModule implements OnApplicationBootstrap {
  constructor(
    @Inject('GOAL3_FIRESTORE')
    private goal3Firestore: Goal3Firestore,
    private readonly oneSignalNotification: Notification,

    @Inject(QueueService)
    private queueService: QueueService,
  ) {}

  async onApplicationBootstrap() {
    await this.queueService.testUserQueue("test");
    // await this.goal3Firestore.testConnection();
    // await this.oneSignalNotification.sendToAll({
    //   title: 'testnoti',
    //   launchUrl: '/ccccc',
    //   content: 'casca',
    //   onesignalAppId: '611f78ab-1f2b-40e0-9e7b-c5eef7ce8ca0',
    //   onesignalApiKey: 'YzE4NmRmNDUtY2NkOC00OGVkLWIxODktNTk3YTgxM2FhYmJm',
    // });
  }
}
