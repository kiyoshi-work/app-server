import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserSegmentEntity } from '../entities/user-segment.entity';
import { UserRepository } from './user.repository';
import { Inject } from '@nestjs/common';
import { SegmentRepository } from './segment.repository';

export class UserSegmentRepository extends Repository<UserSegmentEntity> {
  @Inject(UserRepository)
  private readonly userRepository: UserRepository;

  @Inject(SegmentRepository)
  private readonly segmentRepository: SegmentRepository;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(UserSegmentEntity, dataSource.createEntityManager());
  }

  async findOneByUserSegmentId(
    userId: string,
    segmentId: string,
  ): Promise<UserSegmentEntity> {
    return this.createQueryBuilder('user-segment')
      .where('user-segment.user_id = :user_id', { user_id: userId })
      .andWhere('user-segment.segment_id = :segment_id', {
        segment_id: segmentId,
      })
      .limit(1)
      .getOne();
  }

  async updateWhenUserAdded(userId: string) {
    if (!(await this.exist({ where: { user_id: userId } }))) {
      const user = await this.userRepository.findOneUserById(userId);
      if (user && user.client_id) {
        const segments = await this.segmentRepository.findSegmentsByClient(
          user.client_id,
        );
        await this.upsert(
          segments.map((segment) => ({
            segment_id: segment.id,
            user_id: user.id,
          })),
          { conflictPaths: ['user_id', 'segment_id'] },
        );
      }
    }
  }

  async updateWhenSegmentAdded(segmentId: string) {
    const segment = await this.segmentRepository.findOneSegmentById(segmentId);
    if (segment && segment.client_id) {
      const users = await this.createQueryBuilder('user-segment')
        .leftJoin('user-segment.segment', 'segment')
        .where({
          segment: {
            client_id: segment.client_id,
          },
        })
        .select('DISTINCT user-segment.user_id', 'user_id')
        .getRawMany();
      await this.upsert(
        users.map((user) => ({
          segment_id: segment.id,
          user_id: user.user_id,
        })),
        { conflictPaths: ['user_id', 'segment_id'] },
      );
    }
  }
}
