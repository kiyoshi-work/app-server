import {
  MAX_EXTERNAL_IDS_SEND_NOTIFICATION,
  getAppId,
} from '@/onesignal/constant';
import { RateLimitExternalIdsException } from '@/onesignal/exceptions/api-v1.exception';
import {
  IPBodySendNotificationByExternalIds,
  IParamsSendNotificationByExternalIds,
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

  async sendByExternalIds(params: IParamsSendNotificationByExternalIds) {
    if (params.externalIds.length > MAX_EXTERNAL_IDS_SEND_NOTIFICATION) {
      throw new RateLimitExternalIdsException();
    }

    const data: IPBodySendNotificationByExternalIds = {
      app_id: getAppId(),
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
  }
}
