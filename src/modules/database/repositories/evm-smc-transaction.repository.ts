import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { EVMSmcTransactionEntity } from '../entities/evm-smc-transaction.entity';

export class EVMSmcTransactionRepository extends Repository<EVMSmcTransactionEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(EVMSmcTransactionEntity, dataSource.createEntityManager());
  }

  async getLastSmartContractTransaction(contractName?: string) {
    return this.findOne({
      where: {
        block_number: Not(IsNull()),
        contract_name: contractName,
      },
      order: { block_number: 'desc' },
    });
  }
}
