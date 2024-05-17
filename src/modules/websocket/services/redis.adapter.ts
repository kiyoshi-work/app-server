import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
// import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  // @Inject('REDIS')
  // private redisAdapter: Redis;

  async connectToRedis(): Promise<void> {
    // const redisAdapter = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` }); // use to publish message

    const redisAdapter = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      lazyConnect: true,
      db: Number(process.env.REDIS_PDATABASE),
      password: process.env.REDIS_PASSWORD,
    });
    const subClient = redisAdapter.duplicate();
    await Promise.all([redisAdapter.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(redisAdapter, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
