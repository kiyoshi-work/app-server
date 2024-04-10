import { registerAs } from '@nestjs/config';

export const configAI = registerAs('ai', () => ({
  open_ai_key: process.env.OPEN_AI_API_KEY,
}));
