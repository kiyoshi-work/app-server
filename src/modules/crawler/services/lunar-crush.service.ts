import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseRequestService } from './base-request.service';
export type TTweet = {
  tweet_id: string;
  content: string;
  post_created: Date;
  post_sentiment: number;
  interactions_24h: number;
  interactions_total: number;
};
@Injectable()
export class LunarCrushService extends BaseRequestService {
  constructor(private readonly configService: ConfigService) {
    super(
      configService.get<string>('crawler.lunar_crush.host'),
      configService.get<string>('crawler.lunar_crush.token'),
    );
  }

  protected _buildHeader(): Record<string, string> {
    const headers = super._buildHeader();
    headers['Authorization'] = `Bearer ${this._apiKey}`; // Add the API key to the headers
    return headers;
  }

  async fetchTweets(
    username: string,
    start?: Date,
    end?: Date,
  ): Promise<TTweet[]> {
    const options = {
      method: 'GET',
      url: `/creator/twitter/${username}/posts/v1`,
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
