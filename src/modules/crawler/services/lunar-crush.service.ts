import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
export type TTweet = {
  tweet_id: string;
  content: string;
  post_created: Date;
  post_sentiment: number;
  interactions_24h: number;
  interactions_total: number;
};
@Injectable()
export class LunarCrushService {
  private _token?: string;
  private _host?: string;
  constructor(private readonly configService: ConfigService) {
    this._token = this.configService.get<string>('crawler.lunar_crush.token');
    this._host = this.configService.get<string>('crawler.lunar_crush.host');
  }

  _buildHeader() {
    return {
      Authorization: `Bearer ${this._token}`,
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

  async fetchTweets(
    username: string,
    start?: Date,
    end?: Date,
  ): Promise<TTweet[]> {
    const options = {
      method: 'GET',
      url: `${this._host}/creator/twitter/${username}/posts/v1`,
      params: {
        ...(start && { start: Math.round(new Date(start).getTime() / 1000) }),
        ...(end && { end: Math.round(new Date(end).getTime() / 1000) }),
      },
      headers: this._buildHeader(),
    };
    const data = await this.sendRequest(options);
    return data?.data.map((dt) => ({
      tweet_id: dt.id,
      post_created: new Date(Number(dt.post_created) * 1000),
      content: dt.post_title,
      post_sentiment: Number(dt.post_sentiment),
      interactions_24h: Number(dt.interactions_24h),
      interactions_total: Number(dt.interactions_total),
    }));
  }
}
