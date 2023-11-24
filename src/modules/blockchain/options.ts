import { ModuleMetadata, Type } from '@nestjs/common';

export interface BlockchainOptions {
  isGlobal?: boolean;
  mainnet: boolean;
}

export interface BlockchainAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  isGlobal: boolean;
  useExisting?: Type<BlockchainOptions>;
  useFactory?: (
    ...args: any[]
  ) => Promise<BlockchainOptions> | BlockchainOptions;
  inject?: any[];
}

export interface BlockchainAsyncOptionsFactory {
  createOptions(): Promise<BlockchainOptions> | BlockchainOptions;
}
