import { registerAs } from '@nestjs/config';
import process from 'process';
import fs from 'fs';
import path from 'path';

const serverCaProd = fs.readFileSync(
  path.join(__dirname, '../../../ssl/redis/prod/server-ca.pem'),
);

const serverCaStag = fs.readFileSync(
  path.join(__dirname, '../../../ssl/redis/stag/server-ca.pem'),
);
export const configQueue = registerAs('queue', () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  database: process.env.REDIS_DATABASE,
  password: process.env.REDIS_PASSWORD,
  tls:
    process.env.APP_ENV == 'production' ||
      process.env.APP_ENV == 'staging' ||
      process.env.APP_ENV == 'testing'
      ? {
        ca: process.env.APP_ENV == 'production' ? serverCaProd : serverCaStag,
      }
      : null,
}));
