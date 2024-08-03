import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { Cron, CronExpression } from '@nestjs/schedule';
import EventAbi from '@/blockchain/abi/Events.json';
import { WEI6, toNumber } from '@/shared/utils/helper';
import { CONTRACTS_ADDRESS } from '@/blockchain/configs';
import {
  EVMSmcTransactionRepository,
  SmcEventRepository,
} from '@/modules/database/repositories';
@Injectable()
export class SyncEventSMCService implements OnApplicationBootstrap {
  private fromBlock: number;
  public chainId: number;
  public isRunning: boolean;
  public runAt: number;
  public contractName: string;
  public creditContract: Contract;
  @Inject('BLAST_CONNECTION')
  private blastProvider: ethers.providers.JsonRpcProvider;

  constructor(
    private smcEventRepository: SmcEventRepository,
    private eVMSmcTransactionRepository: EVMSmcTransactionRepository,
  ) {}

  private initialize = async () => {
    this.isRunning = false;
    this.runAt = Date.now();
    this.contractName = 'event';
    const network = await this.blastProvider.getNetwork();
    this.chainId = network.chainId;
    // GET LAST block_number
    const { block_number } = await this.smcEventRepository.findOneBy({
      chain_id: this.chainId,
      contract: this.contractName,
    });
    this.fromBlock = Number(block_number || 600000);

    const contractAddresses = CONTRACTS_ADDRESS[network.chainId].Event;
    this.creditContract = new Contract(
      contractAddresses,
      EventAbi.abi,
      this.blastProvider,
    );
  };

  async onApplicationBootstrap() {
    await this.initialize();
  }

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
        '🚀 ~ file: sync-smc-event.service.ts:69 ~ SyncEventSMCService ~ updateFromBlock ~ error:',
        error,
      );
    }
  }

  private _lockListening() {
    this.isRunning = true;
    this.runAt = Date.now();
  }

  private async _unlockListening(latestBlock?: number) {
    this.fromBlock = latestBlock || this.fromBlock;
    this.isRunning = false;
    this.runAt = 0;
    await this.smcEventRepository.update(
      {
        chain_id: this.chainId,
        contract: this.contractName,
      },
      { block_number: this.fromBlock },
    );
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
        const eventCreateFilter = this.creditContract.filters.EventCreated();
        const eventCreateLogs = await this.creditContract.queryFilter(
          eventCreateFilter,
          this.fromBlock,
          Number(latestBlock),
        );
        const _saveData = [...eventCreateLogs].map((_log) => {
          // const time = (await _log.getBlock())?.timestamp;
          return {
            txhash: _log?.transactionHash,
            block_number: Number(_log?.blockNumber),
            log_index: _log?.logIndex,
            contract_name: this.contractName,
            event_name: _log?.event,
            // time: new Date(time * 1000),
            values: {
              id: _log?.args?.id.toString(),
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
        await this.eVMSmcTransactionRepository.upsert(_saveData as any[], [
          'txhash',
          'log_index',
        ]);

        await this._unlockListening(latestBlock);
      }
    } catch (e) {
      console.log(
        '🚀 ~ file: sync-smc-transaction.service.ts:115 ~ SyncSMCService ~ getFriendTechSniper ~ e:',
        e,
      );
    }
  }
}
