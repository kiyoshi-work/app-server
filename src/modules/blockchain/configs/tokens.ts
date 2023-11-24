export const TOKENS: Record<
  number,
  Record<
    string,
    {
      name: string;
      symbol: string;
      address: string;
      decimals: number;
      coingeckoId: string;
      checkBalance?: boolean;
    }
  >
> = {
  1: {
    WETH: {
      name: 'Wrapped Ether',
      symbol: 'WETH',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: 18,
      coingeckoId: 'ethereum',
    },
  },
  5: {
    WETH: {
      name: 'Wrapped Ether (goerli)',
      symbol: 'WETH',
      address: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
      decimals: 18,
      coingeckoId: 'ethereum',
    },
  },
};
