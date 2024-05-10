import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
export type TTwitterUserMetadata = {
  description: string;
  image_url: string;
  banner_url: string;
  url?: string;
};

export type TTwitterUserInfo = {
  rest_id: string;
  username: string;
  is_blue_verified?: boolean;
  follower_count: number;
  following_count: number;
  name?: string;
  metadata?: TTwitterUserMetadata;
};

@Injectable()
export class RapidTwitterService {
  private _rapidKey?: string;
  private _rapidHost?: string;
  constructor(private readonly configService: ConfigService) {
    this._rapidKey = this.configService.get<string>('crawler.rapid_api.key');
    this._rapidHost = `https://${this.configService.get<string>(
      'crawler.rapid_api.twitter_host',
    )}/v1`;
  }

  _buildHeader() {
    return {
      'X-RapidAPI-Key': this._rapidKey,
      'X-RapidAPI-Host': this.configService.get<string>(
        'crawler.rapid_api.twitter_host',
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
  async getListFollowing(userId: string): Promise<TTwitterUserInfo[]> {
    // const options = {
    //   method: 'GET',
    //   url: `${this._rapidHost}/following.php`,
    //   params: {
    //     screenname: screen_name,
    //   },
    //   headers: this._buildHeader(),
    // };
    // const { following } = await this.sendRequest(options);
    const options = {
      method: 'GET',
      url: `${this._rapidHost}/user-followings`,
      params: {
        userId: userId,
      },
      headers: this._buildHeader(),
    };
    const { entries } = await this.sendRequest(options);
    const userFollowings: TTwitterUserInfo[] = [];
    entries.forEach((entry) => {
      const result = entry?.content?.itemContent?.user_results?.result;
      if (result && result?.rest_id)
        userFollowings.push({
          rest_id: result?.rest_id,
          is_blue_verified: result?.is_blue_verified,
          username: result?.legacy?.screen_name,
          follower_count: Number(result?.legacy?.followers_count || 0),
          following_count: Number(result?.legacy?.friends_count || 0),
          name: result?.legacy?.name,
          metadata: {
            description: result?.legacy?.description,
            image_url: result?.legacy?.profile_image_url_https.replace(
              '_normal',
              '',
            ),
            banner_url: result?.legacy?.profile_banner_url,
            url: result?.legacy?.url,
          },
        });
    });
    return userFollowings;
  }
}
