import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Unique('UNI_CHAIN_CONTRACT_INDEX', ['chain_id', 'contract'])
@Entity('smc_events')
export class SmcEventEntity extends BaseEntity {
  @Column({
    type: 'int',
    nullable: true,
    comment: 'block number',
  })
  block_number: number;

  @Column({
    nullable: true,
  })
  signature: string;

  @Column({
    type: 'text',
    nullable: false,
    comment: 'Contract Name',
  })
  contract: string;

  @Column({
    nullable: false,
    comment: 'chain Id',
  })
  chain_id: number;
}
