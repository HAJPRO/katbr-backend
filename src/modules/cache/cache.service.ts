import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service.js';

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  // Cache'dan ma'lumot olish
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.getClient().get(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  // Cache'ga ma'lumot yozish
  async set(
    key: string,
    value: unknown,
    ttlSeconds = 300,
  ): Promise<void> {
    await this.redis
      .getClient()
      .set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  // Cache'ni o'chirish
  async delete(key: string): Promise<void> {
    await this.redis.getClient().del(key);
  }

  // Cache mavjudligini tekshirish
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.getClient().exists(key);

    return result === 1;
  }

  // Cache TTL vaqtini olish
  async getTTL(key: string): Promise<number> {
    return await this.redis.getClient().ttl(key);
  }

  async deleteByPattern(pattern: string): Promise<void> {
  const client = this.redis.getClient();
  let cursor = '0';

  do {
    const [nextCursor, keys] = await client.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100,
    );

    cursor = nextCursor;

    if (keys.length > 0) {
      await client.del(...keys);
    }
  } while (cursor !== '0');
}
}