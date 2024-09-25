import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  AccountLayout,
  AccountState,
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Commitment,
  Connection,
  GetBalanceConfig,
  PUBLIC_KEY_LENGTH,
  PublicKey,
} from '@solana/web3.js';
import { BN } from 'bn.js';
import { ethers } from 'ethers';
import { Metaplex } from '@metaplex-foundation/js';
export const WRAPPED_SOLANA_ADDRESS =
  'So11111111111111111111111111111111111111112';
export const SOLANA_ADDRESS = 'So11111111111111111111111111111111111111111';

@Injectable()
export class SolanaService {
  constructor(
    @Inject('SOLANA_CONNECTION')
    private readonly solanaProvider: Connection,
  ) {}
  async getSolanaBalance(
    walletAddress: string,
    commitmentOrConfig?: Commitment | GetBalanceConfig,
  ) {
    const balance = ethers.utils.formatUnits(
      await this.solanaProvider.getBalance(
        new PublicKey(walletAddress),
        commitmentOrConfig,
      ),
      9,
    );
    return balance;
  }

  // [{
  //     "isNative": false,
  //     "mint": "8q3RM2eZM9BUe1eoVUkCn4crLYbXk2cSvxURf9mkyexq",
  //     "owner": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  //     "state": "initialized",
  //     "tokenAmount": {
  //       "amount": "928581278",
  //       "decimals": 6,
  //       "uiAmount": 928.581278,
  //       "uiAmountString": "928.581278"
  //     }
  //   }]
  async getTokenHoldings(address: string) {
    try {
      const [token, token2022] = await Promise.all([
        this.solanaProvider.getParsedTokenAccountsByOwner(
          new PublicKey(address),
          {
            programId: TOKEN_PROGRAM_ID,
          },
          'confirmed',
        ),
        this.solanaProvider.getParsedTokenAccountsByOwner(
          new PublicKey(address),
          {
            programId: new PublicKey(
              'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
            ),
          },
          'confirmed',
        ),
      ]);
      return token.value
        .concat(token2022.value)
        .filter(
          (item) => item.account.data.parsed.info.tokenAmount.uiAmount > 0,
        )
        .map((item) => ({ ...item.account.data.parsed.info }));
    } catch (e) {
      console.log('[getTokenHoldings] [error]: ', e);
      return [];
    }
  }
  async getNativeAmount(walletAddress: string) {
    const nativeAmount = ethers.utils.formatUnits(
      await this.solanaProvider.getBalance(new PublicKey(walletAddress)),
      9,
    );
    return nativeAmount;
  }

  // [{
  //   "tokenAddress": "8arEYgkmJgp6GDorP1wjby4z7JiR7VbVEpDZY1hCbBAr",
  //   "balance": 29797,
  //   "symbol": "",
  //   "decimals": 9
  // }]
  async getTokenBalance(walletAddress: string, isNative = false) {
    const listTokensInWallet = await this.getTokenHoldings(walletAddress);
    const nativeAmount = await this.getNativeAmount(walletAddress);
    const result = listTokensInWallet.map((token) => {
      return {
        tokenAddress: token.mint,
        balance: Number(token.tokenAmount.uiAmount) || 0,
        symbol: token?.symbol || '',
        decimals: Number(token?.tokenAmount?.decimals) || 9,
      };
    });

    if (Number(nativeAmount) > 0 && isNative) {
      result.push({
        tokenAddress: WRAPPED_SOLANA_ADDRESS,
        balance: Number(nativeAmount),
        symbol: 'SOL',
        decimals: 9,
      });
    }

    return result;
  }
  async getTokenHoldingsV2(address: string) {
    try {
      const [token, token2022] = await Promise.all([
        this.solanaProvider.getTokenAccountsByOwner(
          new PublicKey(address),
          {
            programId: TOKEN_PROGRAM_ID,
          },
          'confirmed',
        ),
        this.solanaProvider.getTokenAccountsByOwner(
          new PublicKey(address),
          {
            programId: TOKEN_2022_PROGRAM_ID,
          },
          'confirmed',
        ),
      ]);
      return token.value
        .concat(token2022.value)
        .filter(
          (item) =>
            AccountLayout.decode(item.account.data).amount.toString() !== '0',
        )
        .map((item) => {
          const accountDecode = AccountLayout.decode(item.account.data);
          return {
            tokenAddress: accountDecode.mint.toString(),
            isFrozen: accountDecode.state === AccountState.Frozen,
            amount: accountDecode.amount.toString(),
          };
        });
    } catch (e) {
      console.log('[getTokenHoldings] [error]: ', e);
      return [];
    }
  }

  async getTokenBalanceV2(walletAddress: string, isNative = false) {
    const listTokensInWallet = await this.getTokenHoldingsV2(walletAddress);

    const nativeAmount = await this.getNativeAmount(walletAddress);

    const result = listTokensInWallet.map((token) => {
      // console.log('🚀 ~ BlockchainService ~ result ~ token:', token);
      return {
        tokenAddress: token.tokenAddress,
        balance: token.amount,
        isFrozen: token.isFrozen || false,
      };
    });

    if (Number(nativeAmount) > 0 && isNative) {
      result.push({
        tokenAddress: WRAPPED_SOLANA_ADDRESS,
        balance: Number(nativeAmount),
        symbol: 'SOL',
        decimals: 9,
      } as any);
    }

    return result;
  }

  async getBalanceByTokenAddress(
    inputTokenAddress: string,
    walletAddress: string,
  ) {
    try {
      let balance;
      if (
        inputTokenAddress.toLowerCase() == SOLANA_ADDRESS.toLowerCase()
        // inputTokenAddress.toLowerCase() == WRAPPED_SOLANA_ADDRESS.toLowerCase()
      ) {
        balance = ethers.utils.formatUnits(
          await this.solanaProvider.getBalance(new PublicKey(walletAddress)),
          9,
        );
      } else {
        const walletPublicKey = new PublicKey(walletAddress);

        const tokenInfo = await this.solanaProvider.getParsedAccountInfo(
          new PublicKey(inputTokenAddress),
        );

        const tokenAccounts =
          await this.solanaProvider.getParsedTokenAccountsByOwner(
            walletPublicKey,
            {
              programId: new PublicKey(tokenInfo.value.owner),
            },
            'confirmed',
          );

        const tokenAccount = tokenAccounts.value.find((account) => {
          return account.account.data.parsed.info.mint === inputTokenAddress;
        });

        balance =
          tokenAccount?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
      }
      return balance;
    } catch (e) {
      throw e;
    }
  }

  async getTopHolders(contractAddress: string) {
    try {
      const [holders, mintAuthority] = await Promise.all([
        this.getTop20TokenHolders(contractAddress, this.solanaProvider),
        this.getMintAuthority(contractAddress),
      ]);

      return this.filterTopHolders(
        holders,
        Number(mintAuthority.supply),
        mintAuthority.mintAuthority?.toString(),
      );
    } catch (error) {
      console.log('🚀 ~ BlockchainService ~ getTopHolders ~ error:', error);
    }
  }

  filterTopHolders(holders, currentSupply: number, mintAuthority: string) {
    let creatorAmount = 0;
    let top5Amount = 0;
    let top20Amount = 0;

    holders.forEach((holder, index) => {
      const amount = Number(holder.amount);
      if (holder.address === mintAuthority) creatorAmount = amount;
      if (index < 5) top5Amount += amount;
      if (index < 20) top20Amount += amount;
    });

    const creatorPercentage = ((creatorAmount / currentSupply) * 100).toFixed(
      2,
    );
    const top5Percentage = ((top5Amount / currentSupply) * 100).toFixed(2);
    const top20Percentage = ((top20Amount / currentSupply) * 100).toFixed(2);

    return {
      creator: `${creatorPercentage} %`,
      top5: `${top5Percentage}%`,
      top20: `${top20Percentage}%`,
    };
  }

  async getMintAuthority(contractAddress: string) {
    const mintPublicKey = new PublicKey(contractAddress);

    const mintAccount = await this.solanaProvider.getAccountInfo(mintPublicKey);

    const mintInfo = await getMint(
      this.solanaProvider,
      mintPublicKey,
      'finalized',
      mintAccount.owner,
    );

    return mintInfo;
  }

  async getTop20TokenHolders(tokenAddress: string, connection: any) {
    try {
      const tokenMintAddress = new PublicKey(tokenAddress);

      // Fetching all token accounts by token mint address
      const response =
        await connection?.getTokenLargestAccounts(tokenMintAddress);

      const largestAccounts = response?.value || [];
      // Sorting accounts by balance and taking top 20
      const topHolders = largestAccounts
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 20);

      return topHolders;
    } catch (error) {
      console.error('Error fetching token holders:', error);
    }
  }

  async checkContractAddress(address: string): Promise<boolean> {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.solanaProvider.getAccountInfo(publicKey);
      if (!accountInfo) {
        return false;
      } else if (
        accountInfo.owner.toBase58() === '11111111111111111111111111111111'
      ) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  async checkWalletAddress(address: string): Promise<boolean> {
    try {
      if (!this.checkSolanaAddress(address)) return false;
      const isCA = await this.checkContractAddress(address);
      return !isCA;
    } catch (error) {
      return false;
    }
  }

  checkSolanaAddress(address: string) {
    try {
      let _bn = null;
      if (typeof address === 'string') {
        // assume base 58 encoding by default
        const decoded = bs58.decode(address);
        if (decoded.length != PUBLIC_KEY_LENGTH) {
          throw new Error(`Invalid public key input`);
        }
        _bn = new BN(decoded);
      } else {
        _bn = new BN(address);
      }

      if (_bn.byteLength() > PUBLIC_KEY_LENGTH) {
        throw new Error(`Invalid public key input`);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async getTokenMetadata(mintAddress: string): Promise<any> {
    const metaplex = Metaplex.make(this.solanaProvider);
    try {
      const metadata = await metaplex
        .nfts()
        .findByMint({ mintAddress: new PublicKey(mintAddress) });

      // console.log(
      //   '🚀 ~ BlockchainService ~ getTokenMetadata ~ metadata:',
      //   metadata,
      // );
      return {
        tokenName: metadata?.name,
        tokenSymbol: metadata?.symbol,
        tokenLogo: metadata?.json?.image,
        description: metadata?.json?.description,
        tokenStandard: metadata?.tokenStandard,
        tokenAddress: mintAddress,
        tokenDecimals: metadata?.mint?.decimals || 9,
      };
      // ... Access other metadata fields
    } catch (error) {
      console.error('Error fetching token metadata:', mintAddress);
      return {
        tokenName: null,
        tokenSymbol: null,
        tokenLogo: null,
        description: null,
        tokenStandard: null,
        tokenDecimals: null,
        tokenAddress: mintAddress,
      };
    }
  }

  async findSolanaAddress(input: string) {
    try {
      const message = 'The found address is not a valid Solana address.';
      // Regex pattern for potential Solana address
      const solanaAddressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
      // Find the first matching address in the input string
      const match = input.match(solanaAddressPattern);
      if (!match) {
        throw new BadRequestException('No Solana address found in the input.');
      }
      // Validate the found address
      const potentialAddress = match[0];
      const isCA = await this.checkContractAddress(potentialAddress);
      console.log('isCA', isCA);
      if (!isCA) {
        throw new BadRequestException(message);
      }
      return potentialAddress;
    } catch (e) {
      const message = 'The found address is not a valid Solana address.';
      throw new BadRequestException(message);
    }
  }
}
