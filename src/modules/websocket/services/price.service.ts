import { Injectable } from '@nestjs/common';
import { Interval, Timeout } from '@nestjs/schedule';
import { PriceGateway } from '../gateways/price.gateway';
import { PriceRepository } from '@/timescale-db/repositories';

@Injectable()
export class PriceService {
  constructor(
    private readonly priceGateway: PriceGateway,
    private readonly priceRepository: PriceRepository,
  ) {}

  // @Interval(500)
  // @Timeout(500)
  async generatePrice() {
    try {
      const tokens = ['btc', 'eth'];
      const symbol = Math.random() <= 0.5 ? tokens[1] : tokens[1];
      const price = Math.random() * 500;
      await this.priceRepository.save({ symbol, price });
      const priceUpdate = { t: Math.floor(Date.now() / 1000), v: price };
      console.log("🚀 ~ file: price.service.ts:23 ~ PriceService ~ generatePrice ~ priceUpdate:", priceUpdate)
      this.priceGateway.emitNewPice(
        symbol,
        priceUpdate,
      );
    } catch (error) {
      console.log(
        '🚀 ~ file: price.service.ts:106 ~ PriceService ~ generatePrice ~ error:',
        error,
      );
    }
  }
}
