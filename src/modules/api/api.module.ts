import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { AuthController, NotificationController } from '@/api/controllers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '@/api/services';
import { LoggerModule } from '@/logger';
import { FirebaseModule, Goal3Firestore } from '@/modules/firebase';
import { configFirebase } from '@/modules/api/configs';
import { SyncUserGoal3Service } from './services/sync-user-goal3.service';
import { OnesignalModule } from '../onesignal/onesignal.module';
import { NotificationService } from './services/notification.service';
import { HealthController } from './controllers/health.controller';

const services = [SyncUserGoal3Service, AuthService, NotificationService];
@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    OnesignalModule,
    FirebaseModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('firebase'),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configFirebase],
    }),
  ],
  controllers: [AuthController, NotificationController, HealthController],
  providers: [...services],
})
export class ApiModule implements OnApplicationBootstrap {
  constructor(
    @Inject('GOAL3_FIRESTORE')
    private goal3Firestore: Goal3Firestore,
  ) {}

  async onApplicationBootstrap() {
    // await this.goal3Firestore.testConnection();
  }
}
