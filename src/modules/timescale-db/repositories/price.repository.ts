import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PriceEntity } from '../entities';
import { EPriceInterval } from '@/shared/constants/enums';
const INIT_PRICE = 1_000_000;

export class PriceRepository extends Repository<PriceEntity> {
  constructor(@InjectDataSource('timescale') private dataSource: DataSource) {
    super(PriceEntity, dataSource.createEntityManager());
  }
  async onModuleInit() {
    await this.createContinuousAggregate();
  }

  async createContinuousAggregate() {
    const createSecond1 = `
CREATE MATERIALIZED VIEW IF NOT EXISTS prices_period_second1
WITH (timescaledb.continuous) as 
SELECT
  time_bucket('1 second', "time") AS t,
  symbol as s,
  avg(price) AS p,
  max(price) as high,
  min(price) as low,
  first(price, time) as open,
  last(price, time) as close
FROM prices
GROUP BY t, symbol;`;
    const createmin1 = `
CREATE MATERIALIZED VIEW IF NOT EXISTS prices_period_min1
WITH (timescaledb.continuous) as 
SELECT
  time_bucket('1 minute', "time") AS t,
  symbol as s,
  avg(price) AS p,
  max(price) as high,
  min(price) as low,
  first(price, time) as open,
  last(price, time) as close
FROM prices
GROUP BY t, symbol;`;
    const createmin5 = `
CREATE MATERIALIZED VIEW IF NOT EXISTS prices_period_min5
WITH (timescaledb.continuous) as 
SELECT
  time_bucket('5 minute', "time") AS t,
  symbol as s,
  avg(price) AS p,
  max(price) as high,
  min(price) as low,
  first(price, time) as open,
  last(price, time) as close
FROM prices
GROUP BY t, symbol;`;
    const createMin15 = `CREATE MATERIALIZED VIEW IF NOT EXISTS prices_period_min15
WITH (timescaledb.continuous) as 
SELECT
  time_bucket('15 minute', "time") AS t,
  symbol as s,
  avg(price) AS p,
  max(price) as high,
  min(price) as low,
  first(price, time) as open,
  last(price, time) as close
FROM prices
GROUP BY t, symbol;`;
    const createHour1 = `
    CREATE MATERIALIZED VIEW IF NOT EXISTS prices_period_hour1
WITH (timescaledb.continuous) as 
SELECT
  time_bucket('1 hour', "time") AS t,
  symbol as s,
  avg(price) AS p,
  max(price) as high,
  min(price) as low,
  first(price, time) as open,
  last(price, time) as close
FROM prices
GROUP BY t, symbol;`;
    const createHour4 = `CREATE MATERIALIZED VIEW IF NOT EXISTS prices_period_hour4
WITH (timescaledb.continuous) as 
SELECT
  time_bucket('4 hour', "time") AS t,
  symbol as s,
  avg(price) AS p,
  max(price) as high,
  min(price) as low,
  first(price, time) as open,
  last(price, time) as close
FROM prices
GROUP BY t, symbol;`;
    const createDay1 = `CREATE MATERIALIZED VIEW IF NOT EXISTS prices_period_day1
WITH (timescaledb.continuous) as 
SELECT
  time_bucket('1 day', "time") AS t,
  symbol as s,
  avg(price) AS p,
  max(price) as high,
  min(price) as low,
  first(price, time) as open,
  last(price, time) as close
FROM prices
GROUP BY t, symbol;`;
    try {
      await this.query('CREATE EXTENSION IF NOT EXISTS timescaledb');
      await this.query(
        `select create_hypertable('prices','time', if_not_exists => true, migrate_data => true)`,
      );
      await this.query(
        'CREATE INDEX ix_symbol_time ON prices (symbol, time DESC)',
      );
      await this.query(createSecond1);
      await this.query(createmin1);
      await this.query(createmin5);
      await this.query(createMin15);
      await this.query(createHour1);
      await this.query(createHour4);
      await this.query(createDay1);
    } catch (error) {
      throw error;
    }
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
    range: EPriceInterval = EPriceInterval.Second1,
  ): Promise<{ period: number; prices: any[] }> {
    switch (range) {
      case EPriceInterval.Second1:
        return {
          period: 1000,
          prices: await this.query(`
            SELECT *
            FROM prices_period_second1
            WHERE s = '${symbol}'
            AND t > NOW() - INTERVAL '5 minutes'
            ORDER BY t ASC;
          `),
        };
      case EPriceInterval.Min1:
        return {
          period: 1 * 60 * 1000,
          prices: await this.query(`
            SELECT *
            FROM prices_period_min1
            WHERE s = '${symbol}'
            AND t > NOW() - INTERVAL '6 hours'
            ORDER BY t ASC;
          `),
        };
      case EPriceInterval.Min5:
        return {
          period: 5 * 60 * 1000,
          prices: await this.query(`
            SELECT *
            FROM prices_period_min5
            WHERE s = '${symbol}'
            AND t > NOW() - INTERVAL '30 hours'
            ORDER BY t ASC;
          `),
        };
      case EPriceInterval.Min15:
        return {
          period: 15 * 60 * 1000,
          prices: await this.query(`
              SELECT *
              FROM prices_period_min15
              WHERE s = '${symbol}'
              AND t > NOW() - INTERVAL '90 hours'
              ORDER BY t ASC;
            `),
        };
      case EPriceInterval.Hour1:
        return {
          period: 60 * 60 * 1000,
          prices: await this.query(`
                  SELECT *
                  FROM prices_period_hour1
                  WHERE s = '${symbol}'
                  AND t > NOW() - INTERVAL '2 weeks'
                  ORDER BY t ASC;
                `),
        };

      case EPriceInterval.Hour4:
        return {
          period: 4 * 60 * 60 * 1000,
          prices: await this.query(`
            SELECT *
            FROM prices_period_hour4
            WHERE s = '${symbol}'
            AND t > NOW() - INTERVAL '2 months'
            ORDER BY t ASC;
          `),
        };
      case EPriceInterval.Day1:
        return {
          period: 24 * 60 * 60 * 1000,
          prices: await this.query(`
              SELECT *
              FROM prices_period_day1
              WHERE s = '${symbol}'
              AND t > NOW() - INTERVAL '1 year'
              ORDER BY t ASC;
            `),
        };
      default:
        return {
          period: 1000,
          prices: await this.query(`
            SELECT *
            FROM prices_period_second1
            WHERE s = '${symbol}'
            AND t > NOW() - INTERVAL '5 minutes'
            ORDER BY t ASC;
          `),
        };
    }
  }
}
