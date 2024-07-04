import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import UserAgent from 'user-agents';

export enum EChainName {
  SOLANA = 'solana',
}
@Injectable()
export class BirdEyeService {
  private readonly birdeye_api_key: string;
  private readonly base_url: string;
  constructor(private readonly configService: ConfigService) {
    this.birdeye_api_key = this.configService.get<string>(
      'crawler.birdeye.api_key',
    );
    this.base_url = this.configService.get<string>('crawler.birdeye.base_url');
  }

  private _buildHeader(chainName: string) {
    return {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      origin: 'https://raydium.io',
      priority: 'u=1, i',
      referer: 'https://raydium.io/',
      'sec-ch-ua':
        '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': new UserAgent().toString(),
      'x-api-key': this.birdeye_api_key,
      'x-chain': chainName,
    };
  }

  async getTokenInfoByAddress(
    address: string,
    chainName: string = EChainName.SOLANA,
  ) {
    const url = `${this.base_url}/defi/token_overview?address=${address}`;
    const headers = this._buildHeader(chainName);

    try {
      const response = await axios.get(url, { headers: headers });
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
    const url = `${this.base_url}/defi/txs/token?address=${address}&tx_type=all&offset=${offset}&limit=${limit}`;
    const headers = this._buildHeader(chainName);
    try {
      const response = await axios.get(url, { headers: headers });
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
}
