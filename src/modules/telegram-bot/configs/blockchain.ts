import { registerAs } from '@nestjs/config';
import { BlockchainOptions } from '@/blockchain';

// console.log('mainnet', Boolean(Number(process.env.IS_MAINNET || 0) == 1));
export const configBlockchain = registerAs(
  'blockchain',
  (): BlockchainOptions => ({
    mainnet: Boolean(Number(process.env.IS_MAINNET || 0) == 1),
  }),
);