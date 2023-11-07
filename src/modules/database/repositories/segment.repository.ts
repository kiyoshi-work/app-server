import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { SegmentEntity } from '../entities/segment.entity';
import { ClientEntity } from '../entities/client.entity';

export class SegmentRepository extends Repository<SegmentEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(SegmentEntity, dataSource.createEntityManager());
  }

  async findSegmentsByClient(client_id: string): Promise<SegmentEntity[]> {
    return this.find({
      where: { client_id },
    });
  }

  async findSegmentByClient(
    client_id: string,
    segment_cid: string,
  ): Promise<SegmentEntity> {
    return this.createQueryBuilder('segment')
      .leftJoinAndMapOne(
        'segment.client',
        ClientEntity,
        'client',
        'segment.client_id = client.id',
      )
      .where('segment.client_id = :client_id', { client_id })
      .where('segment.segment_cid = :segment_cid', { segment_cid })
      .limit(1)
      .getOne();
  }

  async findOneSegmentById(id: string): Promise<SegmentEntity> {
    return this.createQueryBuilder('segment')
      .where('segment.id = :id', { id })
      .limit(1)
      .getOne();
  }
}
