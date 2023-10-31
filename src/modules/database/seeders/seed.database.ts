import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AdminConfigRepository, ClientRepository } from '../repositories';

@Injectable()
export class SeedDatabase implements OnApplicationBootstrap {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly adminConfigRepository: AdminConfigRepository,
  ) {}

  async onApplicationBootstrap() {
    // await this.clientRepository.upsert(
    //   { id: 'cd3a5797-737c-4375-be6f-549caa49bc8d', name: 'Goal3' },
    //   { conflictPaths: ['id'] },
    // );

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
  }
}
