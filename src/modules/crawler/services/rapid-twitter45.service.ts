import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseRequestService } from './base-request.service';
@Injectable()
export class RapidTwitter45Service extends BaseRequestService {
  private _rapidKey?: string;
  private _rapidHost?: string;
  constructor(private readonly configService: ConfigService) {
    super(
      `https://${configService.get<string>('crawler.rapid_api_45.host')}`,
      configService.get<string>('crawler.rapid_api_45.key'),
    );
  }

  protected _buildHeader(): Record<string, string> {
    return {
      ...super._buildHeader(),
      'X-RapidAPI-Key': this._apiKey,
      // 'X-RapidAPI-Host': this.configService.get<string>(
      //   'crawler.rapid_api_45.twitter_host',
      // ),
    };
  }

  async checkLike(username: string, tweet_id: string) {
    const options = {
      method: 'GET',
      url: `/checklike.php`,
      params: {
        screenname: username,
        tweet_id: tweet_id,
      },
      headers: this._buildHeader(),
    };
    const data = await this.sendRequest(options);
    return data?.is_liked;
  }

  async checkRetweet(username: string, tweet_id: string) {
    const options = {
      method: 'GET',
      url: `/checkretweet.php`,
      params: {
        screenname: username,
        tweet_id: tweet_id,
      },
      headers: this._buildHeader(),
    };
    const data = await this.sendRequest(options);
    return data?.is_follow;
  }

  async checkFollow(username: string, follow: string) {
    const options = {
      method: 'GET',
      url: `/checkfollow.php`,
      params: {
        user: username,
        follows: follow,
      },
      headers: this._buildHeader(),
    };
    const data = await this.sendRequest(options);
    return data?.is_follow;
  }
}
