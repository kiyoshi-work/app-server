import { DataSource, Repository } from 'typeorm';
import { Administrator } from '../entities/administrator.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class AdministratorRepository extends Repository<Administrator> {
  constructor(@InjectDataSource('predict-market') private dataSource: DataSource) {
    super(Administrator, dataSource.createEntityManager());
  }
}
