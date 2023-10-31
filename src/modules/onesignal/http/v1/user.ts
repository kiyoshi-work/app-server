import { DEFAULT_VALUE_TAG } from '@/onesignal/constant';
import {
  IBodyAddTags,
  IBodyCreateUser,
  IParamsAddTags,
  IParamsCreateUser,
  IResponseCreateUser,
  IResponseEditTags,
  ITags,
} from '@/onesignal/interfaces/http-v1.interface';
import { generateTagKeyByUser } from '@/onesignal/util';
import { Injectable } from '@nestjs/common';
import { HttpClient } from '../clients/http-client';

@Injectable()
export class User extends HttpClient {
  protected endpoint(): string {
    return '/users';
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
