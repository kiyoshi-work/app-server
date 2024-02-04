import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { BlockchainModule } from '@/blockchain';
import { SyncCreditSMCService } from './services/sync-smc-credit.service';
import { ScheduleModule } from '@nestjs/schedule';

const runSchedule = Boolean(Number(process.env.IS_SCHEDULER || 0));

let schedulers = [];
if (runSchedule) {
  schedulers = [
    SyncCreditSMCService,
  ];
}


@Module({
  imports: [
    DatabaseModule,
    BlockchainModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    ...schedulers,
  ],
  exports: [
    ...schedulers,
  ],
})
export class SyncContractModule { }
