import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseRequestService } from './base-request.service';

export interface DexScreenerPairResponse {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels: string[];
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info: {
    imageUrl: string;
    websites: Array<{
      label: string;
      url: string;
    }>;
    socials: Array<{
      type: string;
      url: string;
    }>;
  };
}
@Injectable()
export class DexScreenerService extends BaseRequestService {
  constructor(private readonly configService: ConfigService) {
    super(configService.get<string>('crawler.dexscreener.api_host'));
  }

  async getBestPairsTokenByAddress(
    contractAddress: string,
  ): Promise<DexScreenerPairResponse> {
    try {
      const url = `/latest/dex/tokens/${contractAddress}`;
      const result = await this.sendRequest({
        method: 'GET',
        url,
      });
      return this.filterBestPairs(result?.pairs) as DexScreenerPairResponse;
    } catch (error) {
      console.log('[getBestPairsTokenByAddress] [error]', error);
      return;
    }
  }

  filterBestPairs(pairs: any) {
    try {
      return (
        pairs &&
        pairs.reduce(
          (max, current) => {
            if (!current?.liquidity?.usd) return max;
            return current?.liquidity?.usd > max?.liquidity?.usd
              ? current
              : max;
          },
          { liquidity: { usd: 0 } },
        )
      );
    } catch (error) {
      console.log('[filterBestPairs] [error]', error);
      return;
    }
  }
}
