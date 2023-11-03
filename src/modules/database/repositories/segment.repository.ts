import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { SegmentEntity } from '../entities/segment.entity';

export class SegmentRepository extends Repository<SegmentEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(SegmentEntity, dataSource.createEntityManager());
  }

  async findSegmentsByClient(client_id: string): Promise<SegmentEntity[]> {
    return this.find({
      where: { client_id },
    });
  }
}
