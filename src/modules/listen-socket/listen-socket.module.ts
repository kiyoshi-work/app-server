import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BingXPriceService } from './bingx-price.service';
import { TransporterModule } from '@/transporter/transporter.module';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    TransporterModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [],
    }),
  ],
  providers: [BingXPriceService],
  exports: [BingXPriceService],
})
export class ListenSocketModule implements OnApplicationBootstrap {
  constructor() {}
  async onApplicationBootstrap() {
    // const t = await this.tokenStatRepository.find();
    // console.log(t);
  }
}
