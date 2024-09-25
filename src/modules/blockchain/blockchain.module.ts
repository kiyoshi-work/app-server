import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { BlockchainOptions, NetworkChainId } from './options';
import { ethers } from 'ethers';
import { CHAINS, configBlockchain } from '@/blockchain/configs';
import { USDCContract } from './smart-contracts';
import { LoggerModule } from '@/logger';
import { DatabaseModule } from '@/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OrderbookContract from './orderbook/orderbook.contract';
import { Connection } from '@solana/web3.js';
import { SolanaService } from './services/solana.service';

@Module({
  imports: [
    LoggerModule,
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configBlockchain],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: 'ETHEREUM_CONNECTION',
      useFactory: async (config: ConfigService) => {
        const blockchainOptions: BlockchainOptions = config.get('blockchain');
        const chainId = blockchainOptions.mainnet ? 1 : 5;
        const chain = CHAINS[chainId];
        return new ethers.providers.JsonRpcProvider(chain.url);
      },
      inject: [ConfigService],
    },
    {
      provide: 'BLAST_CONNECTION',
      useFactory: async (config: ConfigService) => {
        const blockchainOptions: BlockchainOptions = config.get('blockchain');
        const chainId = blockchainOptions.mainnet ? 168587773 : 168587773;
        const chain = CHAINS[chainId];
        try {
          return new ethers.providers.JsonRpcProvider(chain.url);
        } catch (e) {
          console.log('BLAST_CONNECTION');
          console.error(e);
          throw e;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: 'SOLANA_CONNECTION',
      useFactory: async (config: ConfigService) => {
        const blockchainOptions: BlockchainOptions = config.get('blockchain');
        const chainId = blockchainOptions.mainnet ? 101 : 101;
        const chain = CHAINS[chainId];
        try {
          return new Connection(chain.url);
        } catch (e) {
          console.log('SOLANA_CONNECTION');
          console.error(e);
          throw e;
        }
      },
      inject: [ConfigService],
    },

    {
      provide: 'NETWORK_CHAIN_ID',
      useFactory: (config: ConfigService) => {
        const blockchainOptions: BlockchainOptions = config.get('blockchain');
        return {
          ethereum: blockchainOptions.mainnet ? 1 : 5,
          zksync: blockchainOptions.mainnet ? 324 : 280,
          blast: blockchainOptions.mainnet ? 168587773 : 168587773,
        } as NetworkChainId;
      },
      inject: [ConfigService],
    },
    USDCContract,
    OrderbookContract,
    SolanaService,
  ],
  exports: [
    'ETHEREUM_CONNECTION',
    'BLAST_CONNECTION',
    'SOLANA_CONNECTION',
    'NETWORK_CHAIN_ID',
    USDCContract,
    OrderbookContract,
    SolanaService,
  ],
})
export class BlockchainModule implements OnApplicationBootstrap {
  constructor(
    @Inject('BLAST_CONNECTION')
    public provider: ethers.providers.JsonRpcProvider,
    public USDCContract: USDCContract,
    private orderbookContract: OrderbookContract,
    private solanaService: SolanaService,
  ) {}

  async onApplicationBootstrap() {
    // const t = await this.orderbookContract.getConfigAccount();
    // console.log(t, 'orderbookContract.getConfigAccount');
    // const m = await this.solanaService.getTokenBalanceV2('AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2');
    // console.log(JSON.stringify(m));
  }
}
