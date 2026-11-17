import { Module } from '@nestjs/common';
import { RedisService } from './redis.service.js';
import { CacheService } from './cache.service.js';
import { CacheTestController } from './cache-test.controller.js';

@Module({
  controllers: [CacheTestController],
  providers: [RedisService, CacheService],
  exports: [CacheService],
})
export class CacheModule {}