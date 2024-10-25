import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { WorkerThreadService } from './worker-thread.service';

const services = [WorkerThreadService];
@Module({
  imports: [DatabaseModule],
  providers: [...services],
  exports: [...services],
})
export class WorkerThreadModule {}
