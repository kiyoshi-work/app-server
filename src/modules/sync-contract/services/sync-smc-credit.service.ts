import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { Cron, CronExpression } from '@nestjs/schedule';
import CreditAbi from '@/blockchain/abi/Credit.json';
import { WEI6, toNumber } from '@/shared/utils/helper';
import { CONTRACTS_ADDRESS } from '@/blockchain/configs';
@Injectable()
export class SyncCreditSMCService implements OnApplicationBootstrap {
  private fromBlock: number;
  public chainId: number;
  public isRunning: boolean;
  public runAt: number;
  public contractName: string;
  public creditContract: Contract;
  @Inject('BLAST_CONNECTION')
  private blastProvider: ethers.providers.JsonRpcProvider;

  private initialize = async () => {
    this.isRunning = false;
    this.runAt = Date.now();
    this.contractName = 'credit';
    const network = await this.blastProvider.getNetwork();
    this.chainId = network.chainId;
    // GET LAST block_number
    // const { block_number } = await this.smcEventRepository.findOneBy({
    //   chain_id: this.chainId,
    //   contract: this.contractName,
    // });
    const block_number = 600000;
    this.fromBlock = Number(block_number || 600000);

    const contractAddresses = CONTRACTS_ADDRESS[network.chainId].Credit;
    this.creditContract = new Contract(
      contractAddresses,
      CreditAbi.abi,
      this.blastProvider,
    );
  };

  async onApplicationBootstrap() {
    await this.initialize();
  }
  constructor() { }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateFromBlock() {
    try {
      // PERSIST LAST block_number
      // await this.smcEventRepository.update(
      //   {
      //     chain_id: this.chainId,
      //     contract: this.contractName,
      //   },
      //   { block_number: this.fromBlock },
      // );
    } catch (error) {
      console.log(
        '🚀 ~ file: sync-smc-credit.service.ts:69 ~ SyncCreditSMCService ~ updateFromBlock ~ error:',
        error,
      );
    }
  }

  private _lockListening() {
    this.isRunning = true;
    this.runAt = Date.now();
  }

  private _unlockListening(latestBlock?: number) {
    this.fromBlock = latestBlock || this.fromBlock;
    this.isRunning = false;
    this.runAt = 0;
  }

  private _checkListening(): boolean {
    return (
      this.fromBlock > 0 &&
      (!this.isRunning || this.runAt + 60 * 1000 < Date.now())
    );
  }

  @Cron('*/2 * * * * *')
  async syncSMCCredit() {
    try {
      if (this._checkListening()) {
        this._lockListening();
        const latestBlock = Math.min(
          await this.blastProvider.getBlockNumber(),
          this.fromBlock + 1000,
        );
        const eventTopupFilter = this.creditContract.filters.Topup();
        const eventWithdrawFilter = this.creditContract.filters.Withdraw();
        const topUpLogs = await this.creditContract.queryFilter(
          eventTopupFilter,
          this.fromBlock,
          Number(latestBlock),
        );
        const withdrawLogs = await this.creditContract.queryFilter(
          eventWithdrawFilter,
          this.fromBlock,
          Number(latestBlock),
        );
        const _saveData = [...topUpLogs, ...withdrawLogs].map((_log) => {
          // const time = (await _log.getBlock())?.timestamp;
          return {
            txhash: _log?.transactionHash,
            block_number: Number(_log?.blockNumber),
            log_index: _log?.logIndex,
            // chain_id: this.chainId,
            contract_name: this.contractName,
            event_name: _log?.event,
            // time: new Date(time * 1000),
            values: {
              from: _log?.args?.from,
              to: _log?.args?.to,
              amount: toNumber(
                ethers.utils.formatUnits(_log?.args?.amount, WEI6),
              ),
            },
          };
        });
        console.log(
          'SYNC CREDIT from block: ' +
          this.fromBlock +
          ' ---> ' +
          latestBlock +
          ':' +
          _saveData.length,
        );

        // Persist data
        // await this.smcTransactionRepository.upsert(_saveData, [
        //   'txhash',
        //   'log_index',
        // ]);

        this._unlockListening(latestBlock);
      }
    } catch (e) {
      console.log(
        '🚀 ~ file: sync-smc-transaction.service.ts:115 ~ SyncSMCService ~ getFriendTechSniper ~ e:',
        e,
      );
    }
  }
}
