import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService {
  @Inject('REDIS_CACHE')
  private cache: Redis;

  constructor() {}

  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, time?: any) {
    // TODO: add ttl
    time
      ? await this.cache.set(key, value, 'PX', time)
      : await this.cache.set(key, value);
  }

  async reset() {
    await this.cache.reset();
  }

  async del(key: string) {
    await this.cache.del(key);
  }
}
