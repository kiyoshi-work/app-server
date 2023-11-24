import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PriceEntity } from '../entities';
import { EPriceRange } from '@/shared/constants/enums';
const INIT_PRICE = 1_000_000;

export class PriceRepository extends Repository<PriceEntity> {
  constructor(@InjectDataSource('timescale') private dataSource: DataSource) {
    super(PriceEntity, dataSource.createEntityManager());
  }
  async getLastPrice(symbol?: string) {
    const prices = await this.find({
      where: { symbol },
      order: { time: 'desc' },
      take: 1,
      select: ['price'],
    });
    return Number(prices?.[0]?.price || INIT_PRICE);
  }

  async getLastPriceDetail(symbol?: string) {
    const prices = await this.find({
      where: { symbol },
      order: { time: 'desc' },
      take: 1,
      select: ['price', 'time', 'symbol'],
    });
    return prices?.[0];
  }

  async averagePeriodPrice(
    symbol: string,
    range: EPriceRange = EPriceRange.R_1D,
  ) {
    switch (range) {
      case EPriceRange.R_1Y:
        return this.query(`
          SELECT
            time_bucket('1 day', "time") AS t,
            symbol as s,
            avg(price) AS v
          FROM prices p
          WHERE symbol = '${symbol}'
          AND time > NOW() - INTERVAL '1 year'
          GROUP BY t, symbol
          ORDER BY t ASC;
      `);
      case EPriceRange.R_1M:
        return this.query(`
          SELECT
            time_bucket('2 hour', "time") AS t,
            symbol as s,
            avg(price) AS v
          FROM prices p
          WHERE symbol = '${symbol}'
          AND time > NOW() - INTERVAL '1 month'
          GROUP BY t, symbol
          ORDER BY t ASC;
      `);
      case EPriceRange.R_7D:
        return this.query(`
          SELECT
            time_bucket('15 minute', "time") AS t,
            symbol as s,
            avg(price) AS v
          FROM prices p
          WHERE symbol = '${symbol}'
          AND time > NOW() - INTERVAL '7 days'
          GROUP BY t, symbol
          ORDER BY t ASC;
      `);
      case EPriceRange.R_1D:
        return this.query(`
          SELECT
            time_bucket('5 minute', "time") AS t,
            symbol as s,
            avg(price) AS v
          FROM prices p
          WHERE symbol = '${symbol}'
          AND time > NOW() - INTERVAL '1 day'
          GROUP BY t, symbol
          ORDER BY t ASC;
      `);
      default:
        console.log('object');
        return this.query(`
          SELECT
            time_bucket('1 second', "time") AS t,
            symbol as s,
            avg(price) AS v
          FROM prices p
          WHERE symbol = '${symbol}'
          AND time > NOW() - INTERVAL '5 minutes'
          GROUP BY t, symbol
          ORDER BY t ASC;
      `);
    }
  }
}
