import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PriceGateway } from '../gateways/price.gateway';

@Controller('/event')
export class EventController {
  constructor(
    private readonly priceGateway: PriceGateway,
  ) { }

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
}
