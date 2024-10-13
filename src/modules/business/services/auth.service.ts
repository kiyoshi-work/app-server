import { Inject, Injectable } from '@nestjs/common';
import OAuth from 'oauth';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TJWTPayload } from '@/shared/types';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '@/database/repositories';
import { TwitterOauthDto } from '@/api/dtos/login.dto';

@Injectable()
export class AuthService {
  private oauth: OAuth.Oauth;
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {
    this.oauth = new OAuth.OAuth(
      `${this.configService.get<string>('twitter_auth.api_url')}/request_token`,
      `${this.configService.get<string>('twitter_auth.api_url')}/access_token`,
      this.configService.get<string>('twitter_auth.client_id'),
      this.configService.get<string>('twitter_auth.client_secret'),
      '1.0A',
      this.configService.get<string>('twitter_auth.callback'),
      'HMAC-SHA1',
    );
  }

  async authUrl() {
    const record: Partial<{
      oauth_token: string;
      oauth_token_secret: string;
    }> = {};
    // const { oauthToken, oauthTokenSecret } = await this.getOAuthRequestToken();
    // record.oauth_token = oauthToken;
    // record.oauth_token_secret = oauthTokenSecret;
    // await this.cache.set(
    //   `${record.oauth_token}`,
    //   JSON.stringify(record),
    //   120000, // millisecond
    // );
    return this._generateAuthUrlv2();
  }

  async fetchRestIdv2(code: string) {
    try {
      const tokenResponse = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        {
          client_id: this.configService.get<string>('twitter_auth.client_id'),
          grant_type: 'authorization_code',
          redirect_uri: this.configService.get<string>('twitter_auth.callback'),
          code: code,
          code_verifier: 'challenge',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${this.configService.get<string>('twitter_auth.client_id')}:${this.configService.get<string>('twitter_auth.client_secret')}`).toString('base64')}`,
          },
        },
      );
      const { access_token } = tokenResponse.data;
      const userResponse = await axios.get(
        'https://api.twitter.com/2/users/me',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      return {
        rest_id: userResponse?.data?.data?.id,
        twitter_username: userResponse?.data?.data?.username,
      };
    } catch (error) {
      console.log('🚀 ~ TwitterService ~ fetchRestIdv2 ~ error:', error);
      throw error;
    }
  }

  // async fetchRestId(data: TwitterOauthDto) {
  //   try {
  //     const { oauth_token, oauth_verifier } = data;
  //     const values = await this.cache.get(`${oauth_token}`);
  //     const oauth_token_secret = (values as any)?.oauth_token_secret;

  //     const verify_result = await this.getOAuthAccessToken(
  //       oauth_token,
  //       oauth_token_secret,
  //       oauth_verifier,
  //     );

  //     if (!verify_result)
  //       throw new BadRequestException(
  //         'Not fetch twitter access token. Authenticate failures. Try again!',
  //       );

  //     await this.cache.del(`${oauth_token}`);
  //     return {
  //       rest_id: verify_result?.results?.user_id,
  //       twitter_username: verify_result?.results?.screen_name,
  //     };
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  protected async getOAuthAccessToken(
    oauthToken: string,
    oauthTokenSecret: string,
    oauthVerifier: string,
  ) {
    return new Promise<any>((resolve) => {
      this.oauth.getOAuthAccessToken(
        oauthToken,
        oauthTokenSecret,
        oauthVerifier,
        (_t, _oauth_access_token, _oauth_access_token_secret, results) => {
          resolve({
            access_token: _oauth_access_token,
            access_token_secret: _oauth_access_token_secret,
            results,
          });
        },
      );
    });
  }

  protected async getOAuthRequestToken() {
    return new Promise<{ oauthToken: any; oauthTokenSecret: any }>(
      (resolve) => {
        this.oauth.getOAuthRequestToken(
          {},
          (_a, oauth_token, oauth_token_secret) => {
            console.log('🚀 ~ TwitterService ~ getOAuthRequestToken ~ _a:', {
              _a,
            });
            resolve({
              oauthToken: oauth_token,
              oauthTokenSecret: oauth_token_secret,
            });
          },
        );
      },
    );
  }

  protected _generateAuthUrl(oauthToken: string) {
    return `${process.env.TWITTER_API_URL}/authenticate?oauth_token=${oauthToken}`;
  }

  protected _generateAuthUrlv2() {
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${this.configService.get<string>('twitter_auth.client_id')}&redirect_uri=${this.configService.get<string>('twitter_auth.callback')}&scope=tweet.read+users.read+offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;
  }

  async login(dto: TwitterOauthDto) {
    const { rest_id, twitter_username } = await this.fetchRestIdv2(dto.code);
    const user = await this.userRepository.findOne({
      where: {
        // rest_id: rest_id,
      },
    });
    const { id } = user;
    const payload: TJWTPayload = {
      sub: id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<number>(
          'auth.time.access_token_lifetime',
        ),
      }),
      expires_in: this.configService.get<number>(
        'auth.time.access_token_lifetime',
      ),
      token_type: 'Bearer',
    };
  }
}
