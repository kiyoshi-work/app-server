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

  async findOneSegmentById(id: string): Promise<SegmentEntity> {
    return this.createQueryBuilder('segment')
      .where('segment.id = :id', { id })
      .limit(1)
      .getOne();
  }
}
