import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { AdminConfigEntity } from '../entities';

export class AdminConfigRepository extends Repository<AdminConfigEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(AdminConfigEntity, dataSource.createEntityManager());
  }
}
