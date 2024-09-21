import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import UserAgent from 'user-agents';

@Injectable()
export class DexToolService {
  private readonly api_key: string;
  private readonly base_url: string;

  constructor(private readonly configService: ConfigService) {
    this.api_key = this.configService.get<string>('crawler.dextool.api_key');
    this.base_url = this.configService.get<string>('crawler.dextool.base_url');
  }

  private _buildHeader() {
    return {
      'user-agent': new UserAgent().toString(),
      'x-api-key': this.api_key,
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

  async getTopTokenDexTool(ranking: string) {
    try {
      const url = `${this.base_url}/ranking/solana/${ranking}`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result;
    } catch (error) {
      console.log('[getTopTokenDexTool] [error]', error);
      return;
    }
  }

  async sleep(time: number) {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }

  async getTokenDetailByAddress(contractAddress: string) {
    try {
      const url = `${this.base_url}/token/solana/${contractAddress}`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data;
    } catch (error) {
      console.log('[getTokenDetailByAddress] [error]', error);
      return;
    }
  }

  async getInformationTokenByAddress(contractAddress: string) {
    try {
      const url = `${this.base_url}/token/solana/${contractAddress}/info`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data;
    } catch (error) {
      console.log('[getInformationTokenByAddress] [error]', error);
      return;
    }
  }

  async getPriceTokenByAddress(contractAddress: string) {
    try {
      const url = `${this.base_url}/token/solana/${contractAddress}/price`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data;
    } catch (error) {
      console.log('[getPriceTokenByAddress] [error] ', error?.message);
      return;
    }
  }

  async getAuditTokenByAddress(contractAddress: string) {
    try {
      const url = `${this.base_url}/token/solana/${contractAddress}/audit`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data;
    } catch (error) {
      console.log('[getAuditTokenByAddress] [error] ', error?.message);
      return;
    }
  }

  async getHotPools() {
    try {
      const url = `${this.base_url}/ranking/solana/hotpools`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data || null;
    } catch (error) {
      console.log('[getHotPools] [error] ', error?.message);
      return;
    }
  }
}
