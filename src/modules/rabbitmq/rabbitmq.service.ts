import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_MODULE') private readonly client: ClientProxy,
  ) { }

  public send(pattern: string, data: any) {
    return this.client.send(pattern, data).toPromise();
  }

  public emit(pattern: string, data: any) {
    return this.client.emit(pattern, data);
  }
}
