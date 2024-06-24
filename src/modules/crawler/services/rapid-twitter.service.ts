import { Inject, Injectable } from '@nestjs/common';
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
    )}`;
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

  async getTweetsAnchor(username: string, cursor?: string) {
    const options = {
      method: 'GET',
      url: `${this._rapidHost}/user-tweets`,
      params: {
        username: username,
        cursor: cursor,
      },
      headers: this._buildHeader(),
    };
    const data = await this.sendRequest(options);
    if (
      data?.data?.user_result?.result?.timeline_response?.timeline?.instructions
    ) {
      for (const _ins of data?.data?.user_result?.result?.timeline_response
        ?.timeline?.instructions) {
        if (_ins?.__typename === 'TimelineAddEntries') return _ins?.entries;
      }
    }
    return [];
  }

  async fetchTweets(
    username: string,
    maxRecursive: number = 1,
    config: { minView?: number } = { minView: 10000 },
  ) {
    let cursor;
    let entries = [];
    const tweets = [];
    let numQuery = 0;
    while (true) {
      entries = await this.getTweetsAnchor(username, cursor);
      numQuery += 1;
      if (entries.length <= 2) break;
      for (const entry of entries) {
        const dt = entry?.content?.content?.tweetResult?.result?.legacy;
        if (
          dt &&
          // NOTE: Exclude retweet
          !dt?.retweeted_status_result &&
          Number(
            entry?.content?.content?.tweetResult?.result?.view_count_info
              ?.count || 0,
          ) > Number(config?.minView || 10000)
        ) {
          tweets.push({
            tweet_id: entry?.content?.content?.tweetResult?.result?.rest_id,
            post_created: new Date(dt.created_at),
            content: dt.full_text,
            favorite_count: dt.favorite_count,
            reply_count: dt.reply_count,
            retweet_count: dt.retweet_count,
            conversation_id: dt.conversation_id_str,
            reply_to_id: dt.in_reply_to_status_id_str,
            views: Number(
              entry?.content?.content?.tweetResult?.result?.view_count_info
                ?.count || 0,
            ),
            media: dt?.extended_entities?.media.map((media) => ({
              media_url_https: media?.media_url_https,
              original_info: media?.original_info,
              type: media?.type,
            })),
          });
        }
        if (
          entry?.content?.__typename === 'TimelineTimelineCursor' &&
          entry?.content?.cursorType === 'Bottom'
        ) {
          cursor = entry?.content?.value;
        }
      }
      console.log(
        '🚀 ~ RapidTwitterService ~ fetchTweets ~ cursor:',
        cursor,
        maxRecursive,
        numQuery,
        tweets.length,
        username,
      );
      if (maxRecursive <= numQuery) break;
    }
    return { numQuery, tweets };
  }

  async getTweet(tweetId: string) {
    const options = {
      method: 'GET',
      url: `${this._rapidHost}/get-tweet`,
      params: {
        tweet_id: tweetId,
      },
      headers: this._buildHeader(),
    };
    const data = await this.sendRequest(options);
    return data?.data?.tweet_result?.result;
  }

  async getFollowingAnchor(username: string, cursor?: string) {
    const options = {
      method: 'GET',
      url: `${this._rapidHost}/user-following`,
      params: {
        username: username,
        cursor: cursor,
        count: 100,
      },
      headers: this._buildHeader(),
    };
    const data = await this.sendRequest(options);
    if (data?.data?.user?.timeline_response?.timeline?.instructions) {
      for (const _ins of data?.data?.user?.timeline_response?.timeline
        ?.instructions) {
        if (_ins?.__typename === 'TimelineAddEntries') return _ins?.entries;
      }
    }
    return [];
  }

  async getListFollowing(
    username: string,
    isRecursive: boolean = false,
  ): Promise<TTwitterUserInfo[]> {
    const userFollowings: TTwitterUserInfo[] = [];
    let cursor;
    let entries = [];
    while (true) {
      entries = await this.getFollowingAnchor(username, cursor);
      if (entries.length <= 2) break;
      entries.forEach((entry) => {
        const result = entry?.content?.content?.userResult?.result;
        if (
          result &&
          result?.rest_id &&
          entry?.content?.__typename === 'TimelineTimelineItem'
        ) {
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
        }
        if (
          entry?.content?.__typename === 'TimelineTimelineCursor' &&
          entry?.content?.cursorType === 'Bottom'
        ) {
          cursor = entry?.content?.value;
        }
      });
      console.log(
        '🚀 ~ RapidTwitterService ~ getListFollowing ~ cursor:',
        cursor,
      );
      if (!isRecursive) break;
    }
    return userFollowings;
  }

  async getListFollowing47(
    restId: string,
    isRecursive: boolean = false,
  ): Promise<TTwitterUserInfo[]> {
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
        userId: restId,
      },
      headers: this._buildHeader(),
    };
    const userFollowings: TTwitterUserInfo[] = [];
    let data = await this.sendRequest(options);
    let entries = data.entries;
    let cursor = data.cursor;
    while (entries.length && cursor) {
      console.log(
        '🚀 ~ RapidTwitterService ~ getListFollowing ~ cursor:',
        cursor,
      );
      entries.forEach((entry) => {
        const result = entry?.content?.itemContent?.user_results?.result;
        if (result && result?.rest_id)
          userFollowings.push(this.convertTwitterUserData(result));
      });
      data = await this.sendRequest({
        method: 'GET',
        url: `${this._rapidHost}/user-followings`,
        params: {
          userId: restId,
          cursor: cursor,
        },
        headers: this._buildHeader(),
      });
      entries = data.entries;
      cursor = data.cursor;
      if (!isRecursive) break;
    }
    return userFollowings;
  }

  async fetchTweets47(restId: string) {
    const options = {
      method: 'GET',
      url: `${this._rapidHost}/user-tweets-and-replies`,
      params: {
        userId: restId,
      },
      headers: this._buildHeader(),
    };
    const { entries } = await this.sendRequest(options);
    const tweets = [];
    entries.forEach((entry) => {
      const dt = entry?.content?.itemContent?.tweet_results?.result?.legacy;
      if (dt)
        tweets.push({
          tweet_id: entry?.content?.itemContent?.tweet_results?.result?.rest_id,
          post_created: new Date(dt.created_at),
          content: dt.full_text,
          favorite_count: dt.favorite_count,
          reply_count: dt.reply_count,
          retweet_count: dt.retweet_count,
        });
    });
    return tweets;
  }

  convertTwitterUserData(result) {
    return {
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
    };
  }

  /**
   *
   * @param restId
   */
  async fetchUserInfo(restId?: string) {
    try {
      const data = await this.sendRequest({
        method: 'GET',
        url: `${this._rapidHost}/get-user-by-id`,
        params: {
          user_id: restId,
        },
        headers: this._buildHeader(),
      });
      return data;
    } catch (error) {
      console.log('error', error);
    }
  }
}
