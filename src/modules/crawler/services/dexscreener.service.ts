import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import UserAgent from 'user-agents';

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
export class DexScreenerService {
  private readonly api_key: string;

  constructor(private readonly configService: ConfigService) {
    this.api_key = this.configService.get<string>(
      'crawler.dexscreener.api_key',
    );
  }

  private _buildHeader() {
    return {
      'user-agent': new UserAgent().toString(),
    };
  }

  async sendRequest(options: AxiosRequestConfig) {
    try {
      const response = await axios.request({
        ...{ headers: this._buildHeader() },
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getBestPairsTokenByAddress(
    contractAddress: string,
  ): Promise<DexScreenerPairResponse> {
    try {
      const url = `${this.api_key}/latest/dex/tokens/${contractAddress}`;
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
