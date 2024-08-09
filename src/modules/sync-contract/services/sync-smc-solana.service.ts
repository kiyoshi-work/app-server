import {
  SmcEventRepository,
  SolSmcTransactionRepository,
} from '@/database/repositories';
import OrderbookContract from '@/modules/blockchain/orderbook/orderbook.contract';
import { Inject, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import _ from 'lodash';
import {
  parseCreateBuyOrder,
  parseCreateEvent,
} from 'modules/blockchain/orderbook/parseFuntion';
@Injectable()
export class SyncSMCSolanaService {
  private isRunning: boolean;
  public contractName: string;
  private fromSignature: string;

  constructor(
    private smcEventRepository: SmcEventRepository,
    private solSmcTransactionRepository: SolSmcTransactionRepository,
    private orderbookContract: OrderbookContract,
  ) {
    this.isRunning = false;
    this.contractName = 'event';
  }

  async onModuleInit() {
    const { signature } = await this.smcEventRepository.findOneBy({
      contract: this.contractName,
    });
    this.fromSignature = signature;
  }

  private _checkSyncing(): boolean {
    return this.isRunning;
  }

  private _lockSyncing() {
    this.isRunning = true;
  }

  private async _unlockSyncing(latestSignature: string) {
    this.isRunning = false;
    // NOTE: if not pass will re-run old fromSignature
    if (latestSignature && latestSignature !== this.fromSignature) {
      this.fromSignature = latestSignature;
      await this.smcEventRepository.update(
        {
          chain_id: 101,
          contract: this.contractName,
        },
        { signature: latestSignature },
      );
    }
  }

  @Interval(2000)
  async getTxnLogs() {
    if (this._checkSyncing()) {
      console.log('======= Syncing is in progress ... =======');
      return;
    }
    this._lockSyncing();
    let latestSignature;
    try {
      const { data: signatures, latestSignature: _latestSignature } =
        await this.orderbookContract.getTransactions(this.fromSignature);
      latestSignature = _latestSignature;

      if (latestSignature !== this.fromSignature) {
        const rs = [];
        for (const signature of signatures) {
          const transactions =
            await this.orderbookContract.parseTransactions(signature);

          const transaction_push = [];
          for (const transaction of transactions) {
            if (!transaction?.meta?.err) transaction_push.push(transaction);
          }
          rs.push(transaction_push);
        }

        const events = this.orderbookContract
          .parseEvents(_.flatten(rs))
          .reverse();
        console.log(
          `🚀 ~ SyncSMCService ~ getTxnLogs : FROM ${this.fromSignature} ---> ${latestSignature} : ${events.length} transactions`,
        );
        if (events.length) {
          this.saveEvents(events).catch((error) => {
            console.error('[saveEvents]', error);
          });
        }
      }
    } catch (error) {
      console.log('🚀 ~ SyncSMCService ~ getTxnLogs ~ error:', error);
    }
    await this._unlockSyncing(latestSignature);
  }
  async saveEvents(events: any[]) {
    console.log('[saveEvents]', events.length);

    const logCreateEvent = parseCreateEvent(events);
    const logCreateBuyOrder = parseCreateBuyOrder(events);

    const allLogs = [...logCreateEvent, ...logCreateBuyOrder];

    if (allLogs.length) {
      await this.solSmcTransactionRepository
        .addTransactionLogs(allLogs)
        .catch(console.log);
    }
  }
}
