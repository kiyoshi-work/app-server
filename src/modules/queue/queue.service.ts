import { QUEUE_NAME, QUEUE_PROCESSOR } from '@/shared/constants/queue';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAME.USER)
    private userQueue: Queue,

    @InjectQueue(QUEUE_NAME.TELEGRAM_BOT)
    private telegramQueue: Queue,
  ) {}

  addCommandToQueue(cmd: string, params: any, data: any) {
    this.telegramQueue.add(
      QUEUE_PROCESSOR.TELEGRAM_BOT.POOLING_QUEUE,
      {
        cmd: cmd,
        params,
        data,
      },
      {
        removeOnComplete: 20,
        removeOnFail: true,
      },
    );
  }

  async testUserQueue(time: number) {
    await this.userQueue.add(
      QUEUE_PROCESSOR.USER.TEST,
      {
        time,
      },
      {
        // removeOnComplete: 3,
        timeout: 2000,
        removeOnFail: true,
        attempts: 5,
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
        backoff: {
          type: 'fixed', // Use exponential backoff
          delay: 1000, // Initial delay (1 second)
        },
        attempts: 5,
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
        backoff: 4000,
        // delay: 10000,
        removeOnComplete: 20,
        removeOnFail: true,
      },
    );
  }
}
