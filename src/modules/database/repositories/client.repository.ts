import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ClientEntity } from '../entities/client.entity';

export class ClientRepository extends Repository<ClientEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(ClientEntity, dataSource.createEntityManager());
  }
}
