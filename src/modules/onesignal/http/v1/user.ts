import { DEFAULT_VALUE_TAG } from '@/onesignal/constant';
import {
  IBodyAddTags,
  IBodyCreateUser,
  IParamsAddTags,
  IParamsCreateUser,
  IParamsGetUsers,
  IResponseCreateUser,
  IResponseEditTags,
  ITags,
} from '@/onesignal/interfaces/http-v1.interface';
import { generateTagKeyByUser } from '@/onesignal/util';
import { Injectable } from '@nestjs/common';
import { HttpClient } from '../clients/http-client';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class User extends HttpClient {
  protected endpoint(): string {
    return '/users';
  }
  protected getClientHeaders(apiKey?: string): Record<string, string> {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${
        apiKey ? apiKey : process.env.ONESIGNAL_REST_API_KEY
      }`,
    };
  }

  async create(params: IParamsCreateUser): Promise<IResponseCreateUser> {
    const tags: ITags = {};
    params.tags.forEach((tag) => {
      tags[tag] = DEFAULT_VALUE_TAG;
    });

    const data: IBodyCreateUser = {
      identity: {
        external_id: params.userId,
      },
      properties: {
        tags,
      },
    };

    const response = await this.getHttpClient().post<IResponseCreateUser>(
      this.getFullApiV1EndPoint(),
      data,
    );

    return response.data;
  }
  sendRequest = async (options: AxiosRequestConfig) => {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  async listUsers(params: IParamsGetUsers): Promise<IResponseCreateUser> {
    try {
      const options = {
        method: 'GET',
        url: `https://onesignal.com/api/v1/players`,
        timeout: 1000,
        params: {
          app_id: params.appId,
          limit: params.limit,
          offset: params.offset,
        },
        headers: this.getClientHeaders(params.apiKey),
      };
      return this.sendRequest(options);
    } catch (err) {
      console.log('🚀 ~ file: user.ts:65 ~ User ~ listUsers ~ err:', err);
    }
  }

  getAllExternalIds = async (params: IParamsGetUsers) => {
    const externalIds = new Set();
    let _currCount = 0;
    const _getAllExternalIds = async (offset: number = 0) => {
      const response: any = await this.listUsers({ ...params, offset });
      const players = response.players || [];
      players.forEach((player) => externalIds.add(player.external_user_id));
      const totalPlayers = response.total_count || 0;
      _currCount += Number(response.limit);
      if (totalPlayers > _currCount) {
        await _getAllExternalIds(offset + 1);
      }
    };
    await _getAllExternalIds();
    return [...externalIds];
  };

  async addTags(params: IParamsAddTags): Promise<boolean> {
    try {
      const endpoint = `${this.getFullApiV1EndPoint()}/${params.userId}`;
      const tags: ITags = {};
      params.tags.forEach((tag) => {
        tags[tag] = DEFAULT_VALUE_TAG;
      });

      const data: IBodyAddTags = {
        tags: tags,
      };

      const response = await this.getHttpClient().put<IResponseEditTags>(
        endpoint,
        data,
      );

      return response.data.success;
    } catch (error) {
      if (
        error?.response?.data?.errors?.[0] ===
        'No users with this external_id found'
      ) {
        await this.create({
          userId: params.userId,
          tags: params.tags.concat(generateTagKeyByUser(params.userId)),
        });
      } else {
        console.log('addTags oneSignal error', error);
        throw error;
      }
    }
  }

  async deleteTags(params: IParamsAddTags): Promise<boolean> {
    try {
      const endpoint = `${this.getFullApiV1EndPoint()}/${params.userId}`;
      const tags: ITags = {};
      params.tags.forEach((tag) => {
        tags[tag] = '';
      });

      const data: IBodyAddTags = {
        tags: tags,
      };

      const response = await this.getHttpClient().put<IResponseEditTags>(
        endpoint,
        data,
      );

      return response.data.success;
    } catch (error) {
      if (
        error?.response?.data?.errors?.[0] ===
        'No users with this external_id found'
      ) {
        await this.create({
          userId: params.userId,
          tags: [generateTagKeyByUser(params.userId)],
        });
      } else {
        console.log('deleteTags oneSignal error', error);
        throw error;
      }
    }
  }
}
