import { QUEUE_NAME, QUEUE_PROCESSOR } from '@/shared/constants/queue';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(QUEUE_NAME.USER)
export class UserConsumer {
  constructor() { }

  @Process(QUEUE_PROCESSOR.USER.TEST)
  async processUserTest(
    job: Job<{
      userSecurityBoxId: string;
      chatId: string;
      address: string;
      amount: string;
    }>,
  ) {
    // console.log('!2332');
    console.log(job.data);
  }
}
