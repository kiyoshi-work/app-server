import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseRequestService } from './base-request.service';

export enum EChainName {
  SOLANA = 'solana',
}
interface DataPrice {
  value: number;
  updateUnixTime: number;
  updateHumanTime: string;
}

@Injectable()
export class BirdEyeService extends BaseRequestService {
  private readonly base_url: string;
  constructor(private readonly configService: ConfigService) {
    super(
      configService.get<string>('crawler.birdeye.base_url'),
      configService.get<string>('crawler.birdeye.api_key'),
    );

    this.base_url = this.configService.get<string>('crawler.birdeye.base_url');
  }

  protected _buildHeader(): Record<string, string> {
    const headers = super._buildHeader();
    return {
      ...headers,
      'X-API-KEY': this._apiKey,
      'x-chain': EChainName.SOLANA,
    };
  }

  async getTokenPriceByAddress(address: string): Promise<DataPrice> {
    const url = `${this._apiHost}/defi/price?address=${address}`;
    try {
      const response = await axios.get(url);
      return response.data?.data;
    } catch (error) {
      console.error('[BirdeyeService] [getTokenPriceByAddress]', error);
    }
  }

  async getTokenInfoByAddress(
    address: string,
    chainName: string = EChainName.SOLANA,
  ) {
    const url = `${this._apiHost}/defi/token_overview?address=${address}`;
    try {
      const response = await axios.get(url);
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching token price data:', error);
    }
  }

  async getTokenTradesHistoryAnchor(
    address: string,
    chainName: string,
    limit: number = 100,
    offset: number = 0,
  ) {
    const url = `${this._apiHost}/defi/txs/token?address=${address}&tx_type=all&offset=${offset}&limit=${limit}`;
    try {
      const response = await axios.get(url);
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching token price data:', error);
    }
  }

  async getTokenTradesHistory(
    address: string,
    chainName: EChainName,
    maxRecursive: number = 1,
    fromOffset: number = 0,
  ) {
    let numQuery = 0;
    let offset = fromOffset;
    const limit = 50;
    let txnLogs = [];
    while (true) {
      const txnLogResponse = await this.getTokenTradesHistoryAnchor(
        address,
        chainName,
        limit,
        offset,
      );
      txnLogs = [...txnLogs, ...txnLogResponse.items];
      numQuery += 1;
      offset += Math.max(limit, txnLogResponse.items.length);
      if (
        !txnLogResponse ||
        !txnLogResponse.items ||
        !txnLogResponse.items.length ||
        maxRecursive <= numQuery
      ) {
        break;
      }
    }
    return { numQuery, txnLogs };
  }

  async getWalletTradesHistoryAnchor(
    address: string,
    chainName: EChainName = EChainName.SOLANA,
    limit: number = 100,
    before?: string,
  ) {
    const url = `${this.base_url}/wallet/tx_list/token?wallet=${address}&limit=${limit}${before ? `&before=${before}` : ''}`;
    try {
      const response = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching token price data:', error);
    }
  }
}
