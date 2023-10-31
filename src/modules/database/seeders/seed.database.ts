import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientRepository } from '../repositories';

@Injectable()
export class SeedDatabase implements OnApplicationBootstrap {
  constructor(private readonly clientRepository: ClientRepository) {}

  async onApplicationBootstrap() {
    // await this.clientRepository.upsert(
    //   { id: 'cd3a5797-737c-4375-be6f-549caa49bc8d', name: 'Goal3' },
    //   { conflictPaths: ['id'] },
    // );
  }
}
