import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  AdminConfigRepository,
  ClientRepository,
  SmcEventRepository,
} from '../repositories';

@Injectable()
export class SeedDatabase implements OnApplicationBootstrap {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly adminConfigRepository: AdminConfigRepository,
    private readonly smcEventRepository: SmcEventRepository,
  ) {}

  async onApplicationBootstrap() {
    if (
      !(await this.clientRepository.exists({
        where: { id: 'cd3a5797-737c-4375-be6f-549caa49bc8d' },
      }))
    ) {
      await this.clientRepository.upsert(
        { id: 'cd3a5797-737c-4375-be6f-549caa49bc8d', name: 'App 1' },
        { conflictPaths: ['id'] },
      );
    }

    const runSyncUserConfig = {
      id: '988d53bb-a471-4500-99f1-16a653c7b51c',
      key: 'run_sync_user',
      value: 'end',
      data: { from: '2023-03-25' },
    };
    if (
      !(await this.adminConfigRepository.exist({
        where: { id: runSyncUserConfig.id },
      }))
    ) {
      await this.adminConfigRepository.upsert(runSyncUserConfig, {
        conflictPaths: ['id'],
      });
    }
    if (
      !(await this.smcEventRepository.exists({
        where: {
          contract: 'event',
        },
      }))
    ) {
      await this.smcEventRepository.save([
        {
          chain_id: process.env.APP_ENV == 'production' ? 81457 : 168587773,
          contract: 'event',
          block_number: process.env.APP_ENV == 'production' ? 4775252 : 8606258,
        },
      ]);
    }

    if (
      !(await this.smcEventRepository.exists({
        where: {
          contract: 'orderbook',
        },
      }))
    ) {
      await this.smcEventRepository.save([
        {
          chain_id: process.env.APP_ENV == 'production' ? 101 : 101,
          contract: 'orderbook',
          signature:
            process.env.APP_ENV == 'production'
              ? '5mYNKg1o14YTbaw9r2cXja4K6Zb7f4zoMqSbrc56PmxTkAQfnjouLd3MiZYgLgP6uvyvSSzAoqn48zL474g57Shi'
              : '5mYNKg1o14YTbaw9r2cXja4K6Zb7f4zoMqSbrc56PmxTkAQfnjouLd3MiZYgLgP6uvyvSSzAoqn48zL474g57Shi',
        },
      ]);
    }
  }
}
