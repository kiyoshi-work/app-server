import { registerAs } from '@nestjs/config';

export const configRabbitMq = registerAs('rabbitmq', () => ({
  url: process.env.RABITTMQ_URL,
}));
