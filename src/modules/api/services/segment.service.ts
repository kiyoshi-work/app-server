import { BadRequestException, Injectable } from '@nestjs/common';
import {
  SegmentRepository,
  UserRepository,
  UserSegmentRepository,
} from '@/database/repositories';
import {
  AddSegmentDTO,
  GetAllSegmentDTO,
  GetSegmentDTO,
} from '../dtos/segment.dto';
import { ESegmentStatus } from '@/shared/constants/enums';

@Injectable()
export class SegmentService {
  constructor(
    private readonly userSegmentRepository: UserSegmentRepository,
    private readonly userRepository: UserRepository,
    private readonly segmentRepository: SegmentRepository,
  ) {}

  async triggerUserJoin(body: GetSegmentDTO) {
    const user = await this.userRepository.findOneUserByClient(
      body.client_id,
      body.client_uid,
    );
    if (user) {
      await this.userSegmentRepository.updateWhenUserAdded(user.id);
    }
  }

  async addNotiSegment(body: AddSegmentDTO) {
    if (
      await this.segmentRepository.exist({
        where: { client_id: body.client_id, segment_cid: body.segment_cid },
      })
    ) {
      throw new BadRequestException(`segment ${body.segment_cid} existed`);
    } else {
      const segment = await this.segmentRepository.save({
        client_id: body.client_id,
        segment_cid: body.segment_cid,
        name: body.name,
      });
      const users = await this.userSegmentRepository
        .createQueryBuilder('user-segment')
        .leftJoin('user-segment.segment', 'segment')
        .where({
          segment: {
            client_id: segment.client_id,
          },
        })
        .select('DISTINCT user-segment.user_id', 'user_id')
        .getRawMany();
      await this.userSegmentRepository.upsert(
        users.map((user) => ({
          segment_id: segment.id,
          user_id: user.user_id,
        })),
        { conflictPaths: ['user_id', 'segment_id'] },
      );
      return segment;
    }
  }

  async getAllNotiSegment(query: GetAllSegmentDTO) {
    return this.segmentRepository.find({
      where: { client_id: query.client_id },
      select: ['segment_cid', 'id', 'name'],
    });
  }

  async getNotiSegment(query: GetSegmentDTO) {
    const user = await this.userRepository.findOneUserByClient(
      query.client_id,
      query.client_uid,
    );
    if (!user) {
      throw new BadRequestException('Not found user');
    }
    const userSegments = await this.userSegmentRepository.find({
      where: {
        user_id: user.id,
        status: ESegmentStatus.Active,
      },
      select: ['segment_id'],
    });
    const userSegmentActiveIds = userSegments.map(
      (userSeg) => userSeg.segment_id,
    );
    const segments = await this.segmentRepository.findSegmentsByClient(
      query.client_id,
    );
    return segments.map((segment) => ({
      ...segment,
      status: userSegmentActiveIds.includes(segment.id)
        ? ESegmentStatus.Active
        : ESegmentStatus.Inactive,
    }));
  }

  async switchSegment(segmentId: string, query: GetSegmentDTO) {
    const user = await this.userRepository.findOneUserByClient(
      query.client_id,
      query.client_uid,
    );
    if (!user) {
      throw new BadRequestException('Not found user');
    }
    const userSegment = await this.userSegmentRepository.findOneByUserSegmentId(
      user.id,
      segmentId,
    );
    const updatedStatus =
      userSegment?.status === ESegmentStatus.Active
        ? ESegmentStatus.Inactive
        : ESegmentStatus.Active;
    await this.userSegmentRepository.upsert(
      {
        user_id: user.id,
        segment_id: segmentId,
        status: updatedStatus,
      },
      { conflictPaths: ['user_id', 'segment_id'] },
    );
    return updatedStatus;
  }
}
