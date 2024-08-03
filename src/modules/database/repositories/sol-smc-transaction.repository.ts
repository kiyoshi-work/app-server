import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { SolSmcTransactionEntity } from '../entities/solana-smc-transaction.entity';

export class SolSmcTransactionRepository extends Repository<SolSmcTransactionEntity> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    super(SolSmcTransactionEntity, dataSource.createEntityManager());
  }

  async addTransactionLogs(txnLogs: any[]) {
    const _txnLogs = txnLogs.map((txnLog, index) => {
      const { txhash, time, event_name, ..._values } = txnLog;
      return {
        txhash: txhash,
        time: time,
        event_name: event_name,
        contract_name: 'orderbook',
        values: _values,
        index: index + 1,
      };
    });
    const data = await this.upsert(_txnLogs, {
      conflictPaths: ['txhash', 'event_name', 'index'],
    });
    return data;
  }
}
