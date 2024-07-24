import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { BattleLogEntity } from '../entities/battle-log.entity';

export class BattleLogRepository extends Repository<BattleLogEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(BattleLogEntity, dataSource.createEntityManager());
  }
}
