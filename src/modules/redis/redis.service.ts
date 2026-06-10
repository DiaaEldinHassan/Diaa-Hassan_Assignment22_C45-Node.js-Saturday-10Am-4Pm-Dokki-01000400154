import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  constructor(private readonly redis: Redis) {}

  async get(key: string): Promise<any> {
    return this.redis.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<any> {
    const stringfyVal = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttl) {
      return await this.redis.set(key, stringfyVal, { ex: ttl });
    }
    return await this.redis.set(key, stringfyVal);
  }

  async del(key: string): Promise<any> {
    return await this.redis.del(key);
  }
}
