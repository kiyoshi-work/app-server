import {
  MAX_EXTERNAL_IDS_SEND_NOTIFICATION,
  getAppId,
} from '@/onesignal/constant';
import { RateLimitExternalIdsException } from '@/onesignal/exceptions/api-v1.exception';
import {
  IPBodySendNotificationByExternalIds,
  IPBodySendToAll,
  IParamsSendNotificationByExternalIds,
  IParamsSendToAll,
  IResponseSendNotificationByTags,
} from '@/onesignal/interfaces/http-v1.interface';
import { Injectable } from '@nestjs/common';
import { HttpClient } from '../clients/http-client';

@Injectable()
export class Notification extends HttpClient {
  protected apiV1BaseUrl(): string {
    return 'https://onesignal.com/api/v1';
  }

  protected endpoint(): string {
    return '/notifications';
  }

  protected getClientHeaders(apiKey?: string): Record<string, string> {
    return {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${
        apiKey ? apiKey : process.env.ONESIGNAL_REST_API_KEY
      }`,
    };
  }

  async sendToAll(params: IParamsSendToAll) {
    const data: IPBodySendToAll = {
      app_id: params.onesignalAppId || getAppId(),
      contents: {
        en: params.content,
      },
      headings: {
        en: params.title,
      },
      target_channel: 'push',
      included_segments: ['All'],
    };

    if (params.launchUrl) {
      data.url = params.launchUrl;
    }
    try {
      const response =
        await this.getHttpClient().post<IResponseSendNotificationByTags>(
          this.getFullApiV1EndPoint(),
          data,
          {
            headers: this.getClientHeaders(params.onesignalApiKey),
          },
        );
      console.log(
        '🚀 ~ file: notification.ts:51 ~ Notification ~ sendToAll ~ response:',
        response.data,
      );
      return response.data?.id;
    } catch (error) {
      if (error.response) {
        console.error('Response Error Data: ', error.response.data);
        console.error('Response Error Status: ', error.response.status);
        throw error.response.data;
      } else if (error.request) {
        console.error('Request Error: ', error.request);
        throw error.request;
      } else {
        console.error('Error Message: ', error.message);
        throw error.message;
      }
    }
  }

  async sendByExternalIds(params: IParamsSendNotificationByExternalIds) {
    if (params.externalIds.length > MAX_EXTERNAL_IDS_SEND_NOTIFICATION) {
      throw new RateLimitExternalIdsException();
    }

    const data: IPBodySendNotificationByExternalIds = {
      app_id: params.onesignalAppId,
      contents: {
        en: params.content,
      },
      headings: {
        en: params.title,
      },
      target_channel: 'push',
      include_aliases: {
        external_id: params.externalIds,
      },
    };

    if (params.launchUrl) {
      data.url = params.launchUrl;
    }
    try {
      const response =
        await this.getHttpClient().post<IResponseSendNotificationByTags>(
          this.getFullApiV1EndPoint(params.onesignalAppId),
          data,
          {
            headers: this.getClientHeaders(params.onesignalApiKey),
          },
        );
      console.log(
        '🚀 ~ file: notification.ts:128 ~ Notification ~ sendByExternalIds ~ response:',
        response.data,
      );
      return response.data?.id;
    } catch (error) {
      // Handle errors here
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response Error Data: ', error.response.data);
        console.error('Response Error Status: ', error.response.status);
        throw error.response.data;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request Error: ', error.request);
        throw error.request;
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error Message: ', error.message);
        throw error.message;
      }
    }
  }
}
