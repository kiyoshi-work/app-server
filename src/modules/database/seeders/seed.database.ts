import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  AdminConfigRepository,
  ClientRepository,
  SegmentRepository,
} from '../repositories';

@Injectable()
export class SeedDatabase implements OnApplicationBootstrap {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly adminConfigRepository: AdminConfigRepository,
    private readonly segmentRepository: SegmentRepository,
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

    const goal3Segments = [
      {
        id: '06ad152c-4f8e-4f93-9dd5-1802182c156d',
        client_id: 'cd3a5797-737c-4375-be6f-549caa49bc8d',
        segment_cid: 'soccer',
        name: 'soccer',
      },
      {
        id: 'f89df1b1-591f-4c0a-b326-9f36c2e9b267',
        client_id: 'cd3a5797-737c-4375-be6f-549caa49bc8d',
        segment_cid: 'basketball',
        name: 'basketball',
      },

      {
        id: '32b8d8ed-a89c-48d0-8301-73965591aba9',
        client_id: 'cd3a5797-737c-4375-be6f-549caa49bc8d',
        segment_cid: 'mma',
        name: 'mma',
      },

      {
        id: '462fd62d-c34c-4d50-a237-e5ec1e0581e7',
        client_id: 'cd3a5797-737c-4375-be6f-549caa49bc8d',
        segment_cid: 'baseball',
        name: 'baseball',
      },

      {
        id: 'c138442f-dcba-4380-92a2-46467bc5fc40',
        client_id: 'cd3a5797-737c-4375-be6f-549caa49bc8d',
        segment_cid: 'american-football',
        name: 'american-football',
      },
    ];
    if (
      !(await this.segmentRepository.exist({
        where: { id: goal3Segments[0].id },
      }))
    ) {
      await this.segmentRepository.upsert(goal3Segments, {
        conflictPaths: ['id'],
      });
    }
  }
}
