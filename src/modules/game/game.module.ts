import { LoggerModule } from '@/logger';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MainRoom } from './rooms/main.room';
import { DatabaseModule } from '@/database';
import { redisStore } from 'cache-manager-redis-store';

const rooms = [MainRoom];
@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: 'REDIS_CACHE',
      useFactory: async (config: ConfigService) => {
        const urlRedis = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DATABASE}`;
        return await redisStore({
          url: urlRedis,
        });
      },
      inject: [ConfigService],
    },
    ...rooms,
  ],
  exports: [],
})
export class GameModule {}
