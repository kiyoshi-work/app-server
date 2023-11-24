import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@/logger';
import { TimescaleDBModule } from '@/timescale-db';
import { PriceGateway } from './gateways/price.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceService } from './services/price.service';
import { DatabaseModule } from '@/database';

const services = [PriceService];
@Module({
  imports: [
    LoggerModule,
    TimescaleDBModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [],
    }),
  ],
  controllers: [],
  providers: [PriceGateway, ...services],
})
export class WebsocketModule {}
