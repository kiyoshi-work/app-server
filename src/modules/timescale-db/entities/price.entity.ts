import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('prices')
export class PriceEntity {
  // @PrimaryGeneratedColumn('uuid')
  // id: string;

  @Column({ type: 'text', nullable: false })
  // @Column({ type: 'varchar', length: 32, nullable: false })
  symbol: string;

  @Column('double precision')
  // { precision: 10, scale: 2 }
  price: number;

  @PrimaryColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  // @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  time: Date;
}
