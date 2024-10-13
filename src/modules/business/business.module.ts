import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { configTwitterAuth } from './configs/twitter-auth';
import { JwtModule } from '@nestjs/jwt';
import { EventModule } from '@/event/event.module';
import { OnesignalModule } from '@/onesignal/onesignal.module';
import { Notification } from '@/onesignal/http/v1/notification';

const services = [AuthService, NotificationService];
@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configTwitterAuth],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.key.jwt_secret_key'),
        global: true,
      }),
      inject: [ConfigService],
    }),
    OnesignalModule,
    EventModule,
  ],
  providers: [...services],
  exports: [...services],
})
export class BusinessModule implements OnApplicationBootstrap {
  constructor(private readonly oneSignalNotification: Notification) {}

  async onApplicationBootstrap() {
    // await this.oneSignalNotification.sendToAll({
    //   title: 'testnoti',
    //   launchUrl: '/ccccc',
    //   content: 'casca',
    //   onesignalAppId: '611f78ab-1f2b-40e0-9e7b-c5eef7ce8ca0',
    //   onesignalApiKey: 'YzE4NmRmNDUtY2NkOC00OGVkLWIxODktNTk3YTgxM2FhYmJm',
    // });
  }
}
