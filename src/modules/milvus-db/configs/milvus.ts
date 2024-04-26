import { registerAs } from '@nestjs/config';

export const configMilvus = registerAs('milvus', () => ({
  open_ai_key: process.env.OPEN_AI_API_KEY,
  db: {
    host: process.env.DB_MILVUS_HOST || 'milvus',
    port: Number(process.env.DB_MILVUS_PORT) || 19530,
  } as any,
}));
