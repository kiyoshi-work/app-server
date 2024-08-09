import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import _ from 'lodash';
import { Supercharged } from './sdk/idl/supercharged';
import { getConfigPda } from './pda';
import { Program } from '@coral-xyz/anchor';
import { IDLGetter } from './utils';
import { Inject } from '@nestjs/common';
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default class OrderbookContract {
  program: Program<Supercharged>;
  constructor(
    @Inject('SOLANA_CONNECTION')
    private readonly connection: Connection,
  ) {
    this.program = new anchor.Program(IDLGetter as Supercharged, {
      connection: this.connection,
    });
  }

  async getTransactions(untilSignature?: string): Promise<{
    data: Array<string[]>;
    latestSignature?: string;
  }> {
    const signatures = await this._getProgramSignatures(untilSignature);
    console.log(`Found ${signatures.length} signatures`);
    return {
      data: signatures.length ? await this._splitTransactions(signatures) : [],
      latestSignature: signatures.length ? signatures[0] : untilSignature,
    };
  }

  public async parseTransactions(
    signatures: string[],
    retry: number = 2,
  ): Promise<anchor.web3.ParsedTransactionWithMeta[]> {
    const transactions: anchor.web3.ParsedTransactionWithMeta[] = [];
    let cnt = -1;
    while (true) {
      if (cnt >= retry) throw Error('Cannot parseTransactions now');
      cnt += 1;
      try {
        const batchTransactions = await this.connection.getParsedTransactions(
          signatures,
          {
            commitment: 'finalized',
            maxSupportedTransactionVersion: 2,
          },
        );
        console.log('🚀 ~ PredictionMarketSM ~ batchTransactions:', cnt);
        if (batchTransactions.filter((bt) => bt === null)?.length) {
          throw Error('Not found transaction');
        }
        // @ts-ignore
        transactions.push(...batchTransactions);
        break;
      } catch (e) {
        console.log('🚀 ~ PredictionMarketSM.parseTransactions ~ e:', e);
        await sleep(1000);
      }
    }

    return _.flatten(transactions);
  }

  private async _getProgramSignatures(
    untilSignature?: string,
  ): Promise<string[]> {
    const until = untilSignature ? untilSignature : null;
    // NOTE: get jinalize
    const confirmedSignatureInfo =
      await this.connection.getConfirmedSignaturesForAddress2(
        this.program.programId,
        // @ts-ignore
        { until: until },
        'finalized',
      );
    return confirmedSignatureInfo
      .filter((item) => item.err == null)
      .map((item) => item.signature);
  }

  private async _splitTransactions(
    signatures: string[],
  ): Promise<Array<string[]>> {
    let batchSignatures: Array<string[]>;
    if (signatures.length < 10) {
      batchSignatures = [signatures];
    } else {
      batchSignatures = _.chunk(signatures, 10);
    }

    return batchSignatures;
  }

  parseEvent(transactionParsed: anchor.web3.ParsedTransactionWithMeta) {
    const eventParser = new anchor.EventParser(
      this.program.programId,
      new anchor.BorshCoder(this.program.idl),
    );
    // @ts-ignore
    const events = eventParser.parseLogs(transactionParsed.meta.logMessages);
    const eventsData: any[] = [];
    // @ts-ignore
    for (const event of events) {
      eventsData.push(event);
    }
    return eventsData.map((event) => {
      return {
        ...event,
        blockTime: transactionParsed.blockTime,
        signature: transactionParsed.transaction.signatures[0],
      };
    });
  }

  parseEvents(transactionsParsed: anchor.web3.ParsedTransactionWithMeta[]) {
    const events = transactionsParsed.map((transactionParsed) => {
      return this.parseEvent(transactionParsed);
    });
    return _.flatten(events);
  }

  async getConfigAccount() {
    const configPda = getConfigPda(this.program);
    return this.program.account.config.fetch(configPda);
  }
}
