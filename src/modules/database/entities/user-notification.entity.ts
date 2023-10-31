import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { NotificationEntity } from './notification.entity';
import { ENotificationStatus } from '@/shared/constants/enums';

@Entity('user-notification')
export class UserNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  receiver_id: string;

  @ManyToOne(() => UserEntity, (entity) => entity.notifications)
  @JoinColumn({ name: 'receiver_id' })
  receiver: UserEntity;

  @Column({ nullable: false })
  @Index()
  notification_id: string;

  @ManyToOne(() => NotificationEntity, (entity) => entity.receivers)
  @JoinColumn({ name: 'notification_id' })
  notification: NotificationEntity;

  @Column({
    // type: 'enum',
    enum: ENotificationStatus,
    default: ENotificationStatus.Pending,
  })
  status: ENotificationStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
