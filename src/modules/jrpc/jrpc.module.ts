import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@/logger';
import { JsonRpcModule } from '@/shared/libs/json-rpc';
import { JwtModule } from '@nestjs/jwt';
import { HealthHandler } from './handlers';
import { DatabaseModule } from '../database';

const handlers = [HealthHandler];
@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.key.jwt_secret_key'),
        global: true,
      }),
      inject: [ConfigService],
    }),
    JsonRpcModule.forRoot({
      path: '/rpc',
    }),
  ],
  controllers: [],
  providers: [...handlers],
})
export class JRPCModule {}
