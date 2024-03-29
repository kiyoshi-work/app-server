import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const configLangchain = registerAs('langchain', () => ({
  open_ai_key: process.env.OPEN_AI_API_KEY,
  db: {
    type: 'postgres',
    host: process.env.DB_VECTOR_HOST || 'localhost',
    port: Number(process.env.DB_VECTOR_PORT) || 5434,
    username: process.env.DB_VECTOR_USERNAME || 'root',
    password: process.env.DB_VECTOR_PASSWORD || 'root',
    database: process.env.DB_VECTOR_DATABASE || 'test',
    autoLoadEntities: true,
    // logging: true,
  } as PostgresConnectionOptions,
}));
