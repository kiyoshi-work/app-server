import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
@Injectable()
export class ScraperApiService {
  private _scraperApiKey?: string;
  private _scraperApiHost?: string;
  private _tweetscoutHost?: string;
  private _tweetscoutKey?: string;
  constructor(private readonly configService: ConfigService) {
    this._scraperApiKey = this.configService.get<string>(
      'crawler.scraper_api.key',
    );
    this._scraperApiHost = this.configService.get<string>(
      'crawler.scraper_api.host',
    );
    this._tweetscoutHost = this.configService.get<string>(
      'crawler.tweet_scout.host',
    );
    this._tweetscoutKey = this.configService.get<string>(
      'crawler.tweet_scout.key',
    );
  }

  _buildConfig() {
    return {
      timeout: 30000,
      proxy: {
        protocol: 'http',
        host: 'proxy-server.scraperapi.com',
        port: 8001,
        auth: {
          username:
            'scraperapi.device_type=desktop.premium=true.country_code=us',
          password: this._scraperApiKey,
        },
      },
    };
  }

  async sendRequest(options: AxiosRequestConfig) {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async checkProxyIP() {
    try {
      const response = await axios.get('https://api.myip.com', {
        proxy: {
          protocol: 'http',
          host: 'proxy-server.scraperapi.com',
          port: 8001,
          auth: {
            username:
              'scraperapi.device_type=desktop.premium=true.country_code=us',
            password: this._scraperApiKey,
          },
        },
      });
      if (response.status === 200) {
        return response.data.ip;
      } else {
        console.log(response);
        throw new Error(`Can't get proxy ip. ${response.status}`);
      }
    } catch (error) {
      throw new Error(error?.message + '---' + error?.response?.data);
    }
  }

  async test() {
    const options: AxiosRequestConfig = {
      ...this._buildConfig(),
      method: 'GET',
      url: `https://www.dextools.io/app/en/ether/pair-explorer/0x5201523c0ad5ba792c40ce5aff7df2d1a721bbf8?t=1715315222267`,
    };
    return this.sendRequest(options);
  }
}
