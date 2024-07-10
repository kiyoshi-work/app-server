import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('battle_logs')
export class BattleLogEntity extends BaseEntity {
  @Column()
  room_id: string;

  @Column()
  phase: string;

  @Column({ type: 'simple-json', nullable: true })
  data: any;

  @Column({ type: 'simple-json', nullable: true })
  state: any;
}
