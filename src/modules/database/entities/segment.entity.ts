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
} from 'typeorm';
import { ClientEntity } from './client.entity';

@Entity('segments')
@Unique(['client_id', 'segment_cid'])
export class SegmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  @Index()
  client_id: string;

  @Column({ nullable: false })
  @Index()
  segment_cid: string;

  @ManyToOne(() => ClientEntity, (entity) => entity.users)
  @JoinColumn({ name: 'client_id' })
  client: ClientEntity;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
