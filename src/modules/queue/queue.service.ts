import { QUEUE_NAME, QUEUE_PROCESSOR } from '@/shared/constants/queue';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAME.USER)
    private userQueue: Queue,
  ) { }

  async testUserQueue(time: number) {
    await this.userQueue.add(
      QUEUE_PROCESSOR.USER.TEST,
      {
        time,
      },
      {
        removeOnComplete: 20,
        removeOnFail: true,
      },
    );
  }

  async testLock1(time: number) {
    await this.userQueue.add(
      QUEUE_PROCESSOR.USER.TEST_LOCK_1,
      {
        time,
      },
      {
        removeOnComplete: 20,
        removeOnFail: true,
      },
    );
  }

  async testLock2(time: number) {
    await this.userQueue.add(
      QUEUE_PROCESSOR.USER.TEST_LOCK_2,
      {
        time,
      },
      {
        removeOnComplete: 20,
        removeOnFail: true,
      },
    );
  }

  async testFail(attempts: number = 0) {
    await this.userQueue.add(
      QUEUE_PROCESSOR.USER.TEST_FAIL,
      {},
      {
        attempts: attempts,
        delay: 10000,
        removeOnComplete: 20,
        removeOnFail: true,
      },
    );
  }
}
