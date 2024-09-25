import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseRequestService } from './base-request.service';

interface TradingPairToken {
  name: string; // Name of the token
  symbol: string; // Symbol of the token
  address: string; // Address of the token
}

interface TradingPairExchange {
  name: string; // Name of the exchange
  factory: string; // Factory address of the exchange
}

interface TradingPair {
  rank: number; // Rank of the trading pair
  creationBlock: number; // Creation block of the trading pair
  creationTime: string; // Creation time of the trading pair (ISO date string)
  exchange: TradingPairExchange; // Information about the exchange
  address: string; // Address of the trading pair
  mainToken: TradingPairToken; // Main token in the trading pair
  sideToken: TradingPairToken; // Side token in the trading pair
}
interface TokenInfo {
  address: string; // The token's address
  name: string; // The name of the token
  symbol: string; // The token's symbol
  logo: string; // URL to the token's logo
  description: string; // Description of the token
  creationTime: string | null; // Creation time of the token, can be null
  creationBlock: string | null; // Creation block of the token, can be null
  decimals: number; // Number of decimal places
  socialInfo: Record<string, string>; // Social media and contact information
}
interface PriceData {
  price: number;
  priceChain: number;
  price5m: number;
  priceChain5m: number;
  variation5m: number;
  variationChain5m: number;
  price1h: number;
  priceChain1h: number;
  variation1h: number;
  variationChain1h: number;
  price6h: number;
  priceChain6h: number;
  variation6h: number;
  variationChain6h: number;
  price24h: number;
  priceChain24h: number;
  variation24h: number;
  variationChain24h: number;
}

interface TaxInfo {
  min: number | null; // Minimum tax value, can be null
  max: number | null; // Maximum tax value, can be null
  status: string; // Status of the tax
}

interface ContractInfo {
  isOpenSource: string; // Indicates if the contract is open source
  isHoneypot: string; // Indicates if the contract is a honeypot
  isMintable: string; // Indicates if the token is mintable
  isProxy: string; // Indicates if the contract is a proxy
  slippageModifiable: string; // Indicates if slippage is modifiable
  isBlacklisted: string; // Indicates if the contract is blacklisted
  sellTax: TaxInfo; // Information about selling tax
  buyTax: TaxInfo; // Information about buying tax
  isContractRenounced: string; // Indicates if the contract is renounced
  isPotentiallyScam: string; // Indicates if the contract is potentially a scam
  updatedAt: string; // ISO date string for the last update
}

interface SupplyData {
  circulatingSupply: number; // The amount of tokens currently in circulation
  totalSupply: number; // The total amount of tokens that will ever exist
  mcap: number; // Market capitalization
  fdv: number; // Fully diluted valuation
  holders: number; // Number of unique holders
  transactions: number; // Number of transactions
}
@Injectable()
export class DexToolService extends BaseRequestService {
  constructor(private readonly configService: ConfigService) {
    super(
      configService.get<string>('crawler.dextool.base_url'),
      configService.get<string>('crawler.dextool.api_key'),
    );
  }

  protected _buildHeader(): Record<string, string> {
    const headers = super._buildHeader();
    headers['x-api-key'] = this._apiKey; // Add the API key to the headers
    return headers;
  }

  async getTopTokenDexTool(ranking: string) {
    try {
      const url = `/ranking/solana/${ranking}`;
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
  // {
  //   address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  //   name: 'USDT',
  //   symbol: 'USDT',
  //   logo: 'https://www.dextools.io/resources/tokens/logos/3/solana/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png?1696501661',
  //   description: '',
  //   creationTime: null,
  //   creationBlock: null,
  //   decimals: 6,
  //   socialInfo: {
  //     email: '',
  //     facebook: 'https://www.facebook.com/tether.to',
  //     twitter: 'https://twitter.com/Tether_to',
  //     website: 'https://tether.to/',
  //     bitbucket: '',
  //     discord: '',
  //     github: '',
  //     instagram: '',
  //     linkedin: '',
  //     medium: '',
  //     reddit: 'https://www.reddit.com',
  //     telegram: '',
  //     tiktok: '',
  //     youtube: ''
  //   }
  // }
  async getTokenDetailByAddress(contractAddress: string): Promise<TokenInfo> {
    try {
      const url = `/token/solana/${contractAddress}`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data as TokenInfo;
    } catch (error) {
      console.log('[getTokenDetailByAddress] [error]', error);
      return;
    }
  }

  // {
  //   circulatingSupply: 1889938114.50497,
  //   totalSupply: 1889938114.50497,
  //   mcap: 1890210176.9304852,
  //   fdv: 1890210176.9304852,
  //   holders: 1105400,
  //   transactions: 0
  // }
  async getInformationTokenByAddress(
    contractAddress: string,
  ): Promise<SupplyData> {
    try {
      const url = `/token/solana/${contractAddress}/info`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data as SupplyData;
    } catch (error) {
      console.log('[getInformationTokenByAddress] [error]', error);
      return;
    }
  }

  async getPriceTokenByAddress(contractAddress: string): Promise<PriceData> {
    try {
      const url = `/token/solana/${contractAddress}/price`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data as PriceData;
    } catch (error) {
      console.log('[getPriceTokenByAddress] [error] ', error?.message);
      return;
    }
  }

  // {
  //   isOpenSource: 'yes',
  //   isHoneypot: 'no',
  //   isMintable: 'yes',
  //   isProxy: 'unknown',
  //   slippageModifiable: 'unknown',
  //   isBlacklisted: 'yes',
  //   sellTax: { min: null, max: null, status: 'unknown' },
  //   buyTax: { min: null, max: null, status: 'unknown' },
  //   isContractRenounced: 'unknown',
  //   isPotentiallyScam: 'yes',
  //   updatedAt: '2024-07-18T17:36:03.520Z'
  // }
  async getAuditTokenByAddress(contractAddress: string): Promise<ContractInfo> {
    try {
      const url = `/token/solana/${contractAddress}/audit`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data as ContractInfo;
    } catch (error) {
      console.log('[getAuditTokenByAddress] [error] ', error?.message);
      return;
    }
  }

  async getHotPools(): Promise<TradingPair[]> {
    try {
      const url = `/ranking/solana/hotpools`;
      const result = await this.sendRequest({
        method: 'GET',
        url: url,
      });
      return result?.data as TradingPair[];
    } catch (error) {
      console.log('[getHotPools] [error] ', error?.message);
      return;
    }
  }
}
