import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { SmcEventEntity } from '../entities/smc-event.entity';

export class SmcEventRepository extends Repository<SmcEventEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(SmcEventEntity, dataSource.createEntityManager());
  }
}
