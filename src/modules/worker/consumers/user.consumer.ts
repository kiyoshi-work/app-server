import { QUEUE_NAME, QUEUE_PROCESSOR } from '@/shared/constants/queue';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { sleep } from '@zilliz/milvus2-sdk-node';
import { Job } from 'bull';

@Processor(QUEUE_NAME.USER)
export class UserConsumer {
  constructor() { }

  @Process(QUEUE_PROCESSOR.USER.TEST)
  async processUserTest(
    job: Job<{
      time: number;
    }>,
  ) {
    await sleep(job.data.time);
    console.log(job.data);
  }

  @OnQueueCompleted()
  async test(job: Job<any>) {
    console.log('🚀 ~ UserConsumer ~ test ~ jobId:', job.data);
  }
}
