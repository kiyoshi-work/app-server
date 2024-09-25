import {
  SOLANA_ADDRESS,
  WRAPPED_SOLANA_ADDRESS,
} from '@/modules/blockchain/services/solana.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import UserAgent from 'user-agents';
import { BaseRequestService } from './base-request.service';

export interface CoinData {
  base: string;
  target: string;
  market: object;
  last: number;
  volume: number;
  converted_last: object;
  converted_volume: object;
  trust_score: string;
  bid_ask_spread_percentage: number;
  timestamp: string;
  last_traded_at: string;
  last_fetch_at: string;
  is_anomaly: boolean;
  is_stale: boolean;
  trade_url: string | null;
  token_info_url: string | null;
  coin_id: string;
  target_coin_id: string;
}
[];
@Injectable()
export class CoingeckoService extends BaseRequestService {
  constructor(private readonly configService: ConfigService) {
    super(
      configService.get<string>('crawler.coingecko.host'),
      configService.get<string>('crawler.coingecko.api_key'),
    );
  }

  async sendRequest(options: AxiosRequestConfig) {
    return await super.sendRequest({
      ...options,
      params: {
        ...{ x_cg_pro_api_key: this._apiKey },
        ...options.params,
      },
    });
  }

  //  [{
  //     base: 'WIF',
  //     target: 'USD',
  //     market: [Object],
  //     last: 1.693,
  //     volume: 51.923432,
  //     converted_last: [Object],
  //     converted_volume: [Object],
  //     trust_score: 'yellow',
  //     bid_ask_spread_percentage: 0.35482,
  //     timestamp: '2024-09-23T08:54:22+00:00',
  //     last_traded_at: '2024-09-23T08:54:22+00:00',
  //     last_fetch_at: '2024-09-23T08:54:22+00:00',
  //     is_anomaly: false,
  //     is_stale: false,
  //     trade_url: 'https://trade.cex.io/spot/WIF-USD',
  //     token_info_url: null,
  //     coin_id: 'dogwifcoin'
  //   }]
  async getDataCoinGecko(contractAddresses: string): Promise<any> {
    try {
      const ids = 'solana';
      let url;
      if (
        contractAddresses == SOLANA_ADDRESS ||
        contractAddresses == WRAPPED_SOLANA_ADDRESS
      ) {
        url = `/coins/solana`;
      } else {
        url = `/coins/${ids}/contract/${contractAddresses}`;
      }
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result || null;
    } catch (error) {
      return;
    }
  }

  async getTopTokenCoinGecko(
    topNums: string | number,
    query?: string,
    category?: string,
  ) {
    try {
      const url = `/coins/markets?vs_currency=usd&per_page=${topNums}${query ? `&order=${query}` : ''}${category ? `&category=${category}` : ''}`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result || null;
    } catch (error) {
      return;
    }
  }

  async getTokenPrice(address: string, network: string = 'solana') {
    try {
      let prices = {};
      const url = `/onchain/simple/networks/${network}/token_price/${address}`;
      const response = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      prices = response.data?.attributes?.token_prices;
      return prices;
    } catch (error) {
      throw new Error(`Error coins/markets 1: ${error.message}`);
    }
  }

  async fetchCryptoData(ids: string[] = ['ethereum', 'bitcoin']) {
    const url = `/coins/markets?vs_currency=usd&order=market_cap_desc&sparkline=false&locale=en&ids=${ids.join(', ')}%2Cbitcoin`;
    try {
      const response = await this.sendRequest({
        method: 'GET',
        url: url,
        headers: {
          Cookie:
            '__cf_bm=cil4umPejNuyma_Ko6NX9vRdHqz5MeZHLFmibaDs4ZY-1720695254-1.0.1.1-kBEOZbaDzLkfWvcw9fuiTbbyxJX1zJifL9k7MJvi49wTFGSxixj9.3GdMvxD7jP4NIcvdi3YuBQQgaZC5ldrgg',
        },
      });
      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
}
