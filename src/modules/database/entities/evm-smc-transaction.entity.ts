import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Unique('UNI_TX_HASH_LOG_INDEX', ['txhash', 'log_index'])
@Entity('evm_smc_transactions')
export class EVMSmcTransactionEntity extends BaseEntity {
  @Column()
  @Index()
  txhash: string;

  @Column()
  log_index: number;

  @Column({ default: 0 })
  block_number: number;

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
}
