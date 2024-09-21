import * as anchor from '@coral-xyz/anchor';
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createTransferCheckedInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { ed25519 } from '@noble/curves/ed25519';
import { ComputeBudgetProgram, Connection, Transaction } from '@solana/web3.js';
import IDLDevelop from '@/blockchain/orderbook/sdk/idl/develop/supercharged.json';
import { SOLANA_RPC_ENDPOINT } from '../configs';

export const sign = (
  message: Parameters<typeof ed25519.sign>[0],
  secretKey: any,
) => ed25519.sign(message, secretKey.slice(0, 32));

export async function accountExist(
  connection: anchor.web3.Connection,
  account: anchor.web3.PublicKey,
): Promise<boolean> {
  try {
    const info = await connection.getAccountInfo(account, 'confirmed');
    if (info == null || info.data.length == 0) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function getNumberDecimals(
  connection: anchor.web3.Connection,
  token: anchor.web3.PublicKey,
): Promise<number> {
  const info = await connection.getParsedAccountInfo(token);
  const result = (info.value?.data as any).parsed.info.decimals as number;
  return result;
}

export async function buildInstructionsWrapSol(
  connection: anchor.web3.Connection,
  user: anchor.web3.PublicKey,
  lamports: number,
) {
  const instructions: anchor.web3.TransactionInstruction[] = [];
  const associatedTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    user,
  );
  try {
    await getAccount(connection, associatedTokenAccount);
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          user,
          associatedTokenAccount,
          user,
          NATIVE_MINT,
        ),
      );
    }
  }
  instructions.push(
    anchor.web3.SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: associatedTokenAccount,
      lamports: lamports,
    }),
    createSyncNativeInstruction(associatedTokenAccount),
  );

  return instructions;
}

export function buildInstructionsUnWrapSol(user: anchor.web3.PublicKey) {
  const instructions: anchor.web3.TransactionInstruction[] = [];
  const userTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    user,
    false,
  );
  instructions.push(
    createCloseAccountInstruction(userTokenAccount, user, user),
  );
  return instructions;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export const randomInt = (min: number, max: number) => {
  min = Math.max(1, min);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const transferToken = async (
  connection: anchor.web3.Connection,
  from: anchor.web3.Keypair,
  to: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey,
  amount: number,
) => {
  const signerTokenAccount = getAssociatedTokenAddressSync(
    mint,
    from.publicKey,
    false,
  );

  const transaction = new anchor.web3.Transaction();

  const userTokenAccount = getAssociatedTokenAddressSync(mint, to, false);

  try {
    await getAccount(
      connection,
      userTokenAccount,
      'confirmed',
      TOKEN_PROGRAM_ID,
    );
  } catch (e) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        from.publicKey,
        userTokenAccount,
        to,
        mint,
        TOKEN_PROGRAM_ID,
      ),
    );
  }

  const mintDecimals = await getNumberDecimals(connection, mint);

  transaction.add(
    createTransferCheckedInstruction(
      signerTokenAccount,
      mint,
      userTokenAccount,
      from.publicKey,
      amount,
      mintDecimals,
    ),
  );

  const sig = await anchor.web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from],
  );
  console.log('Transaction signature', sig);
  return sig;
};

export const instructionDataToTransactionInstruction = (
  instructionPayload: any,
) => {
  if (instructionPayload === null) {
    return null;
  }

  return new anchor.web3.TransactionInstruction({
    programId: new anchor.web3.PublicKey(instructionPayload.programId),
    keys: instructionPayload.accounts.map((key: any) => ({
      pubkey: new anchor.web3.PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instructionPayload.data, 'base64'),
  });
};

export const getAddressLookupTableAccounts = async (
  connection: anchor.web3.Connection,
  keys: string[],
): Promise<anchor.web3.AddressLookupTableAccount[]> => {
  const addressLookupTableAccountInfos =
    await connection.getMultipleAccountsInfo(
      keys.map((key) => new anchor.web3.PublicKey(key)),
      'confirmed',
    );

  return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
    const addressLookupTableAddress = keys[index];
    if (accountInfo) {
      const addressLookupTableAccount =
        new anchor.web3.AddressLookupTableAccount({
          key: new anchor.web3.PublicKey(addressLookupTableAddress),
          state: anchor.web3.AddressLookupTableAccount.deserialize(
            accountInfo.data,
          ),
        });
      acc.push(addressLookupTableAccount);
    }

    return acc;
  }, new Array<anchor.web3.AddressLookupTableAccount>());
};

async function sendTransactionRpc(rpc: string, data: string) {
  try {
    const connection = new anchor.web3.Connection(rpc, {
      httpHeaders: {
        'Content-Type': 'application/json',
        Origin: 'https://jup.ag',
        Referrer: 'https://jup.ag',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    });
    const txhash = await connection.sendRawTransaction(
      Buffer.from(data, 'base64'),
      {
        maxRetries: 10,
        skipPreflight: true,
        preflightCommitment: 'processed',
      },
    );
    return txhash;
  } catch (e) {
    console.log(
      `🚀 ~ RpcTransactionService ~ sendTransactionRpc ~ e: ${rpc}`,
      e,
    );
  }
}

export async function sendTransaction(data: string) {
  const start = new Date().getTime();
  return new Promise(async (resolve, reject) => {
    try {
      let txhash: string;
      const tx = await sendTransactionRpc(SOLANA_RPC_ENDPOINT, data);
      if (!txhash) {
        const end = new Date().getTime();
        console.log('🚀 ~ sendTransaction ~ end - start', end - start);
        txhash = tx!!;
        resolve(txhash);
      }
      const end2 = new Date().getTime();
      console.log('🚀 ~ sendTransaction ~ end2 - start', end2 - start);
    } catch (e) {
      console.log('[sendTransaction] e', e);
      reject('Send transaction error: ');
    }
  });
}

// NOTE: CREATE AND SEND TX
export async function createAndSendV0Tx(
  signer: anchor.web3.Keypair,
  txInstructions: anchor.web3.TransactionInstruction[],
  addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
  confirmed: boolean = false,
  CUnit?: number,
) {
  // Step 1 - Fetch Latest Blockhash

  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

  try {
    const latestBlockhash = await connection.getLatestBlockhash('finalized');
    console.log(
      '   ✅ - Fetched latest blockhash. Last valid height:',
      latestBlockhash.lastValidBlockHeight,
    );
    if (CUnit) {
      txInstructions = [
        ...txInstructions,
        ComputeBudgetProgram.setComputeUnitLimit({ units: CUnit }),
      ];
    }
    // Step 2 - Generate Transaction Message
    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: signer.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message(addressLookupTableAccounts);

    console.log('   ✅ - Compiled transaction message');

    const transaction = new anchor.web3.VersionedTransaction(messageV0);

    // Step 3 - Sign your transaction with the required Signers
    transaction.sign([signer]);

    console.log('   ✅ - Transaction Signed');
    console.log('transaction size', transaction.serialize().length);

    console.log(
      JSON.stringify(
        await connection.simulateTransaction(transaction, { sigVerify: true }),
        null,
        2,
      ),
    );
    // process.exit();

    // Step 4 - Send our v0 transaction to the cluster
    const txh = Buffer.from(transaction.serialize()).toString('base64');

    const txthash = await sendTransaction(txh).catch((e) => {
      console.log(e.getLogs());
      console.log('eeeeeeeeeee', e);
    });
    // Step 5 - Confirm Transaction
    if (confirmed) {
      const confirmation = await connection.confirmTransaction(
        txthash as string,
        'confirmed',
      );
      // if (confirmation?.value?.err) {
      //   console.log('confirmation.value.err', confirmation.value.err);
      //   return {
      //     message: '❌ Transaction not confirmed.',
      //   };
      // }

      // {
      //   blockTime: 1721734196,
      //   meta: {
      //     computeUnitsConsumed: 26203,
      //     err: { InstructionError: [Array] },
      //     fee: 5000,
      //     innerInstructions: [],
      //     logMessages: [
      //       'Program 7XJ7mRJ4CcRrxFSJ4hQWkRaYTJQREfPCEsLUabzTiG1V invoke [1]',
      //       'Program log: Instruction: MatchOrders',
      //       'Program log: AnchorError occurred. Error Code: AccountNotFound. Error Number: 6008. Error Message: Account Not Found.',
      //       'Program 7XJ7mRJ4CcRrxFSJ4hQWkRaYTJQREfPCEsLUabzTiG1V consumed 26203 of 1000000 compute units',
      //       'Program 7XJ7mRJ4CcRrxFSJ4hQWkRaYTJQREfPCEsLUabzTiG1V failed: custom program error: 0x1778'
      //     ],
      //     postBalances: [
      //       4999875000,   2039280,
      //          2039280,   1837440,
      //          1837440,   2039280,
      //          2039280,   1447680,
      //          1447680,   1141440,
      //          1176240,   1336320,
      //           890880, 934087680,
      //                1,         1
      //     ],
      //     postTokenBalances: [ [Object], [Object], [Object], [Object] ],
      //     preBalances: [
      //       4999880000,   2039280,
      //          2039280,   1837440,
      //          1837440,   2039280,
      //          2039280,   1447680,
      //          1447680,   1141440,
      //          1176240,   1336320,
      //           890880, 934087680,
      //                1,         1
      //     ],
      //     preTokenBalances: [ [Object], [Object], [Object], [Object] ],
      //     rewards: [],
      //     status: { Err: [Object] }
      //   },
      //   slot: 313667129,
      //   transaction: {
      //     message: {
      //       accountKeys: [Array],
      //       addressTableLookups: [],
      //       instructions: [Array],
      //       recentBlockhash: '2jTF95UBQPeKrAUCbbWuPif32BiAhbQDgkHpEF8EB6nz'
      //     },
      //     signatures: [
      //       '4GQhsJssjwZikWSXShkD558qn6UaCUzLu81KM4sPZjgaenTqHABf7RLBj8QnPY1zWSieWYGW3d92St5CUVNCXGXb'
      //     ]
      //   },
      //   version: 0
      // }
      // TIP: catch error onchain
      const waited = await connection.getParsedTransaction(String(txthash), {
        // TIP: for VersionedTransaction
        maxSupportedTransactionVersion: 2,
      });
      if (waited.meta?.err) {
        // NOTE: this case: https://solscan.io/tx/2w49A2FWid7m2hpkXoVjq2n7BLxBYqtoXKoWA4Q1eTTEnXEV9ZC3NshNp3CcoRBfLXJRstfMBLtfx9UnTHpTMJsw?cluster=devnet
        throw new Error('Fail after recorded onchain');
      }
    }

    return {
      message: 'Transaction successfully submitted !',
      tx_hash: txthash as anchor.web3.TransactionSignature,
    };
  } catch (e: any) {
    console.log('[createAndSendV0Tx] [ERROR]', e);
    console.log(
      '[createAndSendV0Tx] [ERROR] [RangeError: encoding overruns Uint8Array]',
      e?.toString()?.includes('RangeError: encoding overruns Uint8Array'),
    );
    console.log('[createAndSendV0Tx] [ERROR] [string]', JSON.stringify(e));
    // const onlyDirectRoutes = e
    //   ?.toString()
    //   ?.includes('RangeError: encoding overruns Uint8Array');
    throw e;
  }
}

// NOTE: BOOKER SIGN TRANSACTION
export async function createAndSerializeV0Tx(
  signer: anchor.web3.Keypair,
  txInstructions: anchor.web3.TransactionInstruction[],
  addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
  commitment: anchor.web3.Commitment = 'confirmed',
) {
  // Step 1 - Fetch Latest Blockhash
  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

  try {
    const latestBlockhash = await connection.getLatestBlockhash(commitment);
    console.log(
      '   ✅ - Fetched latest blockhash. Last valid height:',
      latestBlockhash.lastValidBlockHeight,
    );

    // Step 2 - Generate Transaction Message
    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: signer.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message(addressLookupTableAccounts);
    console.log('   ✅ - Compiled transaction message');
    const transaction = new anchor.web3.VersionedTransaction(messageV0);

    const signature = {
      [signer.publicKey.toString()]: Buffer.from(
        sign(transaction.message.serialize(), signer.secretKey),
      ).toString('base64'),
    };

    console.log('transaction size', transaction.serialize().length);

    // Step 4 - Send our v0 transaction to the cluster
    const serialized_tx = Buffer.from(transaction.serialize()).toString(
      'base64',
    );

    return {
      message: 'Transaction serialized successfully!',
      serialized_tx,
      signature,
    };
  } catch (e: any) {
    const onlyDirectRoutes = e
      ?.toString()
      ?.includes('RangeError: encoding overruns Uint8Array');
    return {
      message: 'Transaction failed.',
      onlyDirectRoutes,
    };
  }
}

// NOTE: SIGN TRANSACTION WITH USER ADDRESS
export async function createAndSerializeTxForUser(
  payerKey: anchor.web3.PublicKey,
  txInstructions: any,
  addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
  commitment: anchor.web3.Commitment = 'confirmed',
) {
  // Step 1 - Fetch Latest Blockhash
  try {
    const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

    const latestBlockhash = await connection.getLatestBlockhash(commitment);
    console.log(
      '   ✅ - Fetched latest blockhash. Last valid height:',
      latestBlockhash.lastValidBlockHeight,
    );

    // Step 2 - Generate Transaction Message
    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message(addressLookupTableAccounts);

    console.log('   ✅ - Compiled transaction message');
    const transaction = new anchor.web3.VersionedTransaction(messageV0);

    console.log('transaction size', transaction.serialize().length);

    // Step 4 - Send our v0 transaction to the cluster
    const serialized_tx = Buffer.from(transaction.serialize()).toString(
      'base64',
    );

    return serialized_tx;
  } catch (e: any) {
    console.log('🚀 ~ e:', e);
    return {
      message: 'Transaction failed.',
    };
  }
}

export async function createAndSerializeV1Tx(
  signer: anchor.web3.Keypair,
  address: anchor.web3.PublicKey,
  txInstructions: anchor.web3.TransactionInstruction[],
  addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
  commitment: anchor.web3.Commitment = 'confirmed',
) {
  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

  try {
    const latestBlockhash = await connection.getLatestBlockhash(commitment);

    console.log(
      '   ✅ - Fetched latest blockHash. Last valid height:',
      latestBlockhash.lastValidBlockHeight,
    );

    const transaction = new Transaction();

    transaction.add(...txInstructions);
    transaction.feePayer = address;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash({ commitment: 'finalized' })
    ).blockhash;

    transaction.partialSign(signer);

    const serializeTrx = transaction
      .serialize({ requireAllSignatures: false })
      .toString('base64');

    return {
      serialized_tx: serializeTrx,
    };
  } catch (e: any) {
    console.log('🚀 ~ e:', e);
    return;
  }
}

export const IDLGetter = (() => {
  switch (process?.env?.APP_ENV) {
    case 'production':
    case 'staging':
    case 'local':
    default:
      return IDLDevelop;
  }
})();
