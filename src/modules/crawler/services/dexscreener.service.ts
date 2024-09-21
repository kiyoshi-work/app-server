import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import UserAgent from 'user-agents';
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

  async getBestPairsTokenByAddress(contractAddress: string) {
    try {
      const url = `${this.api_key}/latest/dex/tokens/${contractAddress}`;
      const result = await this.sendRequest({
        method: 'GET',
        url,
      });
      return this.filterBestPairs(result?.pairs) || null;
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
