import { getAppId } from '@/onesignal/constant';
import axios, { AxiosInstance } from 'axios';

export abstract class HttpClient {
  protected abstract endpoint(): string;

  protected apiV1BaseUrl(appId?: string): string {
    return `https://onesignal.com/api/v1/apps/${appId ? appId : getAppId()}`;
  }

  protected getHttpClient(): AxiosInstance {
    return axios.create();
  }

  protected getFullApiV1EndPoint(appId?: string): string {
    return `${this.apiV1BaseUrl(appId)}${this.endpoint()}`;
  }
}
