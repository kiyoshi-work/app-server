import { Module } from '@nestjs/common';
import { configTimescaleDb } from './configs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '@/logger';
import { PriceRepository } from './repositories';
import { PriceEntity } from '@/timescale-db/entities';

const repositories = [PriceRepository];

const timescaleEntities = [PriceEntity];

@Module({
  imports: [
    LoggerModule,
    TypeOrmModule.forRootAsync({
      name: 'timescale',
      useFactory: (config: ConfigService) => config.get('timescaleDB'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(timescaleEntities, 'timescale'),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configTimescaleDb],
    }),
  ],
  controllers: [],
  providers: [...repositories],
  exports: [...repositories],
})
export class TimescaleDBModule {}
