import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import _ from 'lodash';
import { Supercharged } from './sdk/idl/supercharged';
import {
  getAdminPda,
  getConfigPda,
  getEventPda,
  getOutcomePda,
  getProgramBalancePda,
} from './pda';
import { Program } from '@coral-xyz/anchor';
import { createAndSendV0Tx, IDLGetter } from './utils';
import { Inject } from '@nestjs/common';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default class OrderbookContract {
  program: Program<Supercharged>;
  private readonly operator: any;

  constructor(
    @Inject('SOLANA_CONNECTION')
    private readonly connection: Connection,
  ) {
    this.program = new anchor.Program(IDLGetter as Supercharged, {
      connection: this.connection,
    });
    if (process.env.OPERATOR_PRIVATE_KEY) {
      this.operator = anchor.web3.Keypair.fromSecretKey(
        Uint8Array.from(bs58.decode(process.env.OPERATOR_PRIVATE_KEY)),
      );
    }
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

  async createEvent(
    eventId: number,
    outcomeId: number,
    startTime: Date,
    endTime: Date,
  ) {
    const eventIdBN = new anchor.BN(eventId);
    const outcomeIdBN = new anchor.BN(outcomeId);
    const startTimeBN = new anchor.BN(new Date(startTime).getTime());
    const endTimeBN = new anchor.BN(new Date(endTime).getTime());

    const eventPda = getEventPda(this.program, eventIdBN);
    const outcomePda = getOutcomePda(this.program, outcomeIdBN);
    const programBalancePda = getProgramBalancePda(this.program, outcomeIdBN);
    const adminPda = getAdminPda(this.program, this.operator.publicKey);

    const finalIxs: anchor.web3.TransactionInstruction[] = [];

    const itx = await this.program.methods
      .createEvent(eventIdBN, outcomeIdBN, startTimeBN, endTimeBN)
      .accountsStrict({
        operator: this.operator.publicKey,
        administrator: adminPda,
        event: eventPda,
        outcome: outcomePda,
        balance: programBalancePda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    finalIxs.push(itx);

    const dataSend = await createAndSendV0Tx(this.operator, finalIxs);
    return dataSend;
  }
}
