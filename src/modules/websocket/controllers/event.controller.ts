import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RedisContext,
  RmqContext,
} from '@nestjs/microservices';
import { PriceGateway } from '../gateways/price.gateway';
import { sleep } from '@zilliz/milvus2-sdk-node';

@Controller('/event')
export class EventController {
  constructor(private readonly priceGateway: PriceGateway) {}

  @EventPattern('new-top-askbid')
  async updateNewTopBidAsk(@Payload() data: any) {
    try {
      this.priceGateway.emitNewTopBidAsk(data.symbol, data);
    } catch (error) {
      console.log(
        '🚀 ~ file: event.controller.ts:25 ~ EventController ~ updateNewPrice ~ error:',
        error,
      );
    }
  }

  // @MessagePattern('TEST_MQ_EVENT')
  @EventPattern('TEST_MQ_EVENT')
  async testRMQ(@Payload() data: any, @Ctx() context: RmqContext) {
    // console.log(
    //   '🚀 ~ EventController ~ testRMQ ~ data:',
    //   data,
    //   context.getMessage(),
    // );
    await sleep(3000);
    return data.test + 1;
    // NOTE: use when noAck: false
    // const channel = context.getChannelRef();
    // channel.ack(context.getMessage());
  }
}
