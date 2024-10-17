import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { GCPubSubClient } from 'nestjs-google-pubsub-microservice';

@Injectable()
export class GCPubSubService implements OnApplicationShutdown {
  private _client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    this._client = new GCPubSubClient({
      ...(!(
        process.env.APP_ENV == 'production' ||
        process.env.APP_ENV == 'staging' ||
        process.env.APP_ENV == 'develop'
      ) && {
        client: {
          apiEndpoint: this.configService.get<string>('gc_pubsub.apiEndpoint'),
          projectId: this.configService.get<string>('gc_pubsub.projectId'),
        },
      }),
      topic: this.configService.get<string>('gc_pubsub.topic'),
    });
  }

  onApplicationShutdown(signal?: string) {
    console.log(' =====> DISCONNECT PUB/SUB');
    return this._client.close();
  }

  emitEvent(pattern: any, data: any) {
    console.log(
      '🚀 ~ file: google-pubsub.service.ts:31 ~ GCPubSubService ~ emitEvent ~ pattern:',
      pattern,
      data,
    );
    this._client.emit<any>(pattern, data);
  }

  emitMessage(pattern: any, data?: any) {
    this._client
      .send(pattern, data || {})
      .subscribe((response) => console.log(response));
  }
}
