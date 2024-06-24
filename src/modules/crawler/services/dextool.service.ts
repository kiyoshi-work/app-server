import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
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
  async getAuditTokenByAddress(contractAddress: string) {
    try {
      const url = `${this.base_url}/token/solana/${contractAddress}/audit`;

      const result = await axios.get(url, {
        headers: this._buildHeader(),
      });
      return result?.data.data || null;
    } catch (error) {
      console.log(
        '🚀 ~ DexToolService ~ getAuditTokenByAddress ~ error:',
        error,
      );
      return;
    }
  }
}
