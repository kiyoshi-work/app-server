import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Unique('UNI_TX_HASH_EVENT_NAME_INDEX', ['txhash', 'event_name', 'index'])
@Entity('solana_smc_transactions')
export class SolSmcTransactionEntity extends BaseEntity {
  @Column({
    nullable: true,
  })
  @Index()
  txhash: string;

  @Column({ nullable: true })
  @Index()
  address: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'transaction time',
  })
  time: Date;

  @Column({
    type: 'text',
    nullable: false,
    comment: 'Contract Name',
  })
  contract_name: string;

  @Column({
    type: 'text',
    nullable: false,
    comment: 'Event Name',
  })
  @Index()
  event_name: string;

  @Column({
    type: 'jsonb',
    nullable: false,
    comment: 'Transaction data',
  })
  values: Record<string, any>;

  @Column({
    type: 'int8',
    name: 'status',
    default: 0,
  })
  status: number;

  @Column({
    type: 'int8',
    default: 0,
  })
  index: number;
}
