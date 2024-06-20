import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { PriceGateway } from '../gateways/price.gateway';

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
    console.log(
      '🚀 ~ EventController ~ testRMQ ~ data:',
      data,
      context.getMessage(),
    );
    // NOTE: use when noAck: false
    // const channel = context.getChannelRef();
    // channel.ack(context.getMessage());
  }
}
