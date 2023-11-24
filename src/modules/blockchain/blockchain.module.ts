import { DynamicModule, Module, Type } from '@nestjs/common';
import {
  BlockchainAsyncOptions,
  BlockchainAsyncOptionsFactory,
  BlockchainOptions,
} from './options';
import { ethers } from 'ethers';
import { CHAINS } from '@/blockchain/configs';
import { ERC20Factory } from './smart-contracts';
import { LoggerModule } from '@/logger';

@Module({
  imports: [LoggerModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class BlockchainModule {
  /**
   * Register options
   * @param options
   */
  static registerAsync(options: BlockchainAsyncOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: BlockchainModule,
      providers: [
        ...this.createConnectionBlockchainProvider(options),
        ERC20Factory,
      ],
      exports: ['ETHEREUM_CONNECTION', ERC20Factory],
    };
  }

  private static createConnectionBlockchainProvider(
    options: BlockchainAsyncOptions,
  ) {
    if (options.useFactory) {
      return [
        {
          provide: 'ETHEREUM_CONNECTION',
          useFactory: async (inject: any[]) => {
            const blockchainOptions = await options.useFactory(inject);
            const chainId = blockchainOptions.mainnet ? 1 : 5;
            const chain = CHAINS[chainId];
            return new ethers.providers.JsonRpcProvider(chain.url);
          },
          inject: options.inject || [],
        },
      ];
    }
    const inject = [options.useExisting as Type<BlockchainOptions>];

    return [
      {
        provide: 'ETHEREUM_CONNECTION',
        useFactory: async (optionsFactory: BlockchainAsyncOptionsFactory) => {
          const blockchainOptions = await optionsFactory.createOptions();
          const chainId = blockchainOptions.mainnet ? 1 : 5;
          const chain = CHAINS[chainId];
          return new ethers.providers.JsonRpcProvider(chain.url);
        },
        inject,
      },
    ];
  }
}
