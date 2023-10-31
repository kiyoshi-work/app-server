import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { ClientEntity } from './client.entity';
import { UserNotificationEntity } from './user-notification.entity';

@Entity('users')
@Unique(['client_uid', 'client_id'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  client_id: string;

  @ManyToOne(() => ClientEntity, (entity) => entity.users)
  @JoinColumn({ name: 'client_id' })
  client: ClientEntity;

  @Column({ nullable: false })
  @Index()
  client_uid: string;

  @Column('simple-json', { nullable: true })
  metadata?: object;

  @Column({ nullable: true })
  username?: string;

  @OneToMany(() => UserNotificationEntity, (entity) => entity.receiver)
  notifications: UserNotificationEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
