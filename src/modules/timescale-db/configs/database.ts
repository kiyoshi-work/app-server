import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import fs from 'fs';
import path from 'path';

const serverCaStag = fs.readFileSync(
  path.join(__dirname, '../../../ssl/timescale/stag/server-ca.pem'),
);
const serverCaProd = fs.readFileSync(
  path.join(__dirname, '../../../ssl/timescale/prod/server-ca.pem'),
);

export const configTimescaleDb = registerAs(
  'timescaleDB',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.TIMESCALE_DB_HOST || 'localhost',
    port: Number(process.env.TIMESCALE_DB_PORT) || 3306,
    username: process.env.TIMESCALE_DB_USERNAME || 'root',
    password: process.env.TIMESCALE_DB_PASSWORD || 'root',
    database: process.env.TIMESCALE_DB_DATABASE || 'test',
    entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
    // synchronize: Boolean(process.env.TIMESCALE_DB_SYNC) || false,
    synchronize: true,
    autoLoadEntities: true,
    logging: false,
    ssl:
      process.env.APP_ENV == 'production' || process.env.APP_ENV == 'staging'
        ? {
            ca:
              process.env.APP_ENV == 'production' ? serverCaProd : serverCaStag,
            // rejectUnauthorized: false,
          }
        : null,
  }),
);
