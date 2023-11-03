import { BadRequestException, Injectable } from '@nestjs/common';
import {
  SegmentRepository,
  UserRepository,
  UserSegmentRepository,
} from '@/database/repositories';
import { GetSegmentDTO } from '../dtos/segment.dto';
import { ESegmentStatus } from '@/shared/constants/enums';

@Injectable()
export class SegmentService {
  constructor(
    private readonly userSegmentRepository: UserSegmentRepository,
    private readonly userRepository: UserRepository,
    private readonly segmentRepository: SegmentRepository,
  ) {}

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
