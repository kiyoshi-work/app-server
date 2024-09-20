import { SOLANA_ADDRESS, WRAPPED_SOLANA_ADDRESS } from '@/modules/blockchain/services/solana.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import UserAgent from 'user-agents';
@Injectable()
export class CoingeckoService {
  private _coingeckoKey?: string;
  private _coingeckoHost?: string;
  constructor(private readonly configService: ConfigService) {
    this._coingeckoKey = this.configService.get<string>('crawler.coingecko.api_key');
    this._coingeckoHost = `${this.configService.get<string>(
      'crawler.coingecko.host',
    )}`;
  }

  _buildHeader() {
    const userAgent = new UserAgent();
    return {
        'user-agent': userAgent.toString(),
    };
  }
  async sendRequest(options: AxiosRequestConfig) {
    try {
      const response = await axios.request({
        ...{headers: this._buildHeader()}, 
        ...{
            ...options, params: {
                ...{'x_cg_pro_api_key': this._coingeckoKey}, ...options.params
            }
        },
    });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getDataCoinGecko(contractAddresses: string) {
    try {
      const ids = 'solana';
      let url;
      if (
        contractAddresses == SOLANA_ADDRESS ||
        contractAddresses == WRAPPED_SOLANA_ADDRESS
      ) {
        url = `${this._coingeckoHost}/coins/solana`;
      } else {
        url = `${this._coingeckoHost}/coins/${ids}/contract/${contractAddresses}`;
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


  async getTopTokenCoinGecko(topNums: string, query: string, category: string) {
    try {
      const url = `${this._coingeckoHost}/coins/markets?vs_currency=usd&order=${query}&per_page=${topNums}&category=${category}`;
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
        const url = `${this._coingeckoHost}/onchain/simple/networks/${network}/token_price/${address}`;
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
    const url = `${this._coingeckoHost}/coins/markets?vs_currency=usd&order=market_cap_desc&sparkline=false&locale=en&ids=${ids.join(', ')}%2Cbitcoin`;
    try {
        const response = await this.sendRequest({
            method: 'GET',
            url: url,
            headers:{
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
