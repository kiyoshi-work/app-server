import { ClientEntity } from '@/modules/database/entities/client.entity';
import { ClientRepository } from '@/modules/database/repositories';
import { QUEUE_NAME, QUEUE_PROCESSOR } from '@/shared/constants/queue';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';
import { InjectEntityManager } from '@nestjs/typeorm';
import { sleep } from '@zilliz/milvus2-sdk-node';
import { Job } from 'bull';
import { EntityManager } from 'typeorm';

@Processor(QUEUE_NAME.USER)
export class UserConsumer {
  constructor(
    private readonly clientRepository: ClientRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  @Process(QUEUE_PROCESSOR.USER.TEST)
  async processUserTest(
    job: Job<{
      time: number;
    }>,
  ) {
    console.log('object');
    throw new Error('oo');
    await sleep(job.data.time);
    console.log(job.data);
  }

  @Process(QUEUE_PROCESSOR.USER.TEST_FAIL)
  async processTestFail(job: Job) {
    console.log('===== TEST FAIL ====');
    throw new Error('test fail');
  }

  @Process(QUEUE_PROCESSOR.USER.TEST_LOCK_1)
  async processTestLock1(
    job: Job<{
      time: number;
    }>,
  ) {
    console.log('START TEST 1', job?.data, Date.now());
    await this.entityManager.transaction(async (manager) => {
      const order = await manager
        .createQueryBuilder()
        .from(ClientEntity, 'client')
        .where('client.id = :id', {
          id: 'cd3a5797-737c-4375-be6f-549caa49bc8d',
        })
        .select(['client.name', 'client.id'])
        .limit(1)
        .setLock('pessimistic_write')
        .getOne();
      await sleep(job.data.time);
      if (order.name) {
        try {
          await manager.update(
            ClientEntity,
            { id: order?.id },
            {
              name: 'APP2',
            },
          );
          throw new Error('Badd');
        } catch (error) {
          console.log(
            '🚀 ~ UserConsumer ~ awaitthis.entityManager.transaction ~ error:',
            error,
          );
          throw error;
        }
      }
    });
    console.log('END TEST 1', job.data, Date.now());
  }

  @Process(QUEUE_PROCESSOR.USER.TEST_LOCK_2)
  async processTestLock2(
    job: Job<{
      time: number;
    }>,
  ) {
    console.log('🚀 START TEST 2', job?.data);
    // NOTE: not impact lock
    // await this.clientRepository.findOne({
    //   where: { id: 'cd3a5797-737c-4375-be6f-549caa49bc8d' },
    // });
    await this.entityManager.transaction(async (manager) => {
      try {
        // await manager.update(
        //   ClientEntity,
        //   { id: 'cd3a5797-737c-4375-be6f-549caa49bc8d' },
        //   {
        //     name: 'APP3',
        //   },
        // );

        const order = await manager
          .createQueryBuilder()
          .from(ClientEntity, 'client')
          .where('client.id = :id', {
            id: 'cd3a5797-737c-4375-be6f-549caa49bc8d',
          })
          .select(['client.name', 'client.id'])
          .limit(1)
          // NOTE: if not setLock order can be selected
          // .setLock('pessimistic_read')
          // .setOnLocked('nowait')
          .getOne();
        console.log(
          '🚀 ~ UserConsumer ~ awaitthis.entityManager.transaction ~ order:',
          order,
        );
      } catch (error) {
        console.log(
          '🚀 ~ UserConsumer ~ awaitthis.entityManager.transaction ~ error:',
          error,
          Date.now(),
        );
        throw error;
      }
    });
    console.log('🚀  END TEST 2');
  }

  // @OnQueueCompleted()
  // async test(job: Job<any>) {
  //   console.log('🚀 ~ UserConsumer ~ test ~ jobId:', job.data);
  // }
}
