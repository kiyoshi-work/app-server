import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ESegmentStatus } from '@/shared/constants/enums';
import { SegmentEntity } from './segment.entity';

@Entity('user-segment')
@Unique(['user_id', 'segment_id'])
export class UserSegmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  user_id: string;

  @ManyToOne(() => UserEntity, (entity) => entity.segments)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: false })
  @Index()
  segment_id: string;

  @ManyToOne(() => SegmentEntity)
  @JoinColumn({ name: 'segment_id' })
  segment: SegmentEntity;

  @Column({ default: ESegmentStatus.Active })
  status: ESegmentStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
