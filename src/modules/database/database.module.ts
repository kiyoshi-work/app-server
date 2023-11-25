import { Module } from '@nestjs/common';
import { configDb } from './configs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminConfigEntity, UserEntity } from '@/database/entities';
import {
  AdminConfigRepository,
  ClientRepository,
  NotificationRepository,
  UserRepository,
} from './repositories';
import { LoggerModule } from '@/logger';
import { ClientEntity } from './entities/client.entity';
import { SeedDatabase } from './seeders/seed.database';
import { NotificationEntity } from './entities/notification.entity';
import { UserNotificationEntity } from './entities/user-notification.entity';
import { UserNotificationRepository } from './repositories/user-notification.repository';

const repositories = [
  UserRepository,
  ClientRepository,
  NotificationRepository,
  UserNotificationRepository,
  AdminConfigRepository,
];

const entities = [
  UserEntity,
  ClientEntity,
  NotificationEntity,
  UserNotificationEntity,
  AdminConfigEntity,
];

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('db'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configDb],
    }),
  ],
  controllers: [],
  providers: [...repositories, SeedDatabase],
  exports: [...repositories, SeedDatabase],
})
export class DatabaseModule { }
