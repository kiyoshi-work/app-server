import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { BlockchainModule } from '@/blockchain';
import { SyncEventSMCService } from './services/sync-smc-event.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncSMCSolanaService } from './services/sync-smc-solana.service';

const runSchedule = Boolean(Number(process.env.RUN_SYNC_CONTRACT || 0));

let schedulers = [];
if (runSchedule) {
  schedulers = [SyncEventSMCService, SyncSMCSolanaService];
}

@Module({
  imports: [DatabaseModule, BlockchainModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [...schedulers],
  exports: [...schedulers],
})
export class SyncContractModule {}
