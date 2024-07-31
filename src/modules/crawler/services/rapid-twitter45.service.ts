import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
@Injectable()
export class RapidTwitter45Service {
  private _rapidKey?: string;
  private _rapidHost?: string;
  constructor(private readonly configService: ConfigService) {
    this._rapidKey = this.configService.get<string>('crawler.rapid_api_45.key');
    this._rapidHost = `https://${this.configService.get<string>(
      'crawler.rapid_api_45.host',
    )}`;
  }

  _buildHeader() {
    return {
      'x-rapidapi-key': this._rapidKey,
      'x-rapidapi-host': this.configService.get<string>(
        'crawler.rapid_api_45.twitter_host',
      ),
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

  async checkLike(username: string, tweet_id: string) {
    const options = {
      method: 'GET',
      url: `${this._rapidHost}/checklike.php`,
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
      url: `${this._rapidHost}/checkretweet.php`,
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
      url: `${this._rapidHost}/checkfollow.php`,
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
