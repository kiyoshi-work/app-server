import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('administrator')
export class Administrator {
  @PrimaryColumn({
    type: 'text',
    name: 'wallet',
  })
  wallet: string;

  @Column({
    type: 'text',
    name: 'admin_name',
  })
  admin_name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToMany(() => Role)
  @JoinTable()
  roles: Role[];
}
