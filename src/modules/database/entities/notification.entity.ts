import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { UserNotificationEntity } from './user-notification.entity';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  content?: string;

  @Column({ nullable: true })
  content_html?: string;

  @Column({ nullable: true })
  launch_url?: string;

  @Column({ nullable: true })
  type?: string;

  @OneToMany(() => UserNotificationEntity, (entity) => entity.notification)
  receivers: UserNotificationEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
