import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAME, QUEUE_PROCESSOR } from '../constants';

export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAME.USER)
    private userQueue: Queue,
  ) {}

  async testUserQueue(address: string) {
    await this.userQueue.add(
      QUEUE_PROCESSOR.USER.TEST,
      {
        address,
      },
      {
        removeOnComplete: 20,
        removeOnFail: true,
      },
    );
  }
}
