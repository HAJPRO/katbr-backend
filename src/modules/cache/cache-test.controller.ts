import {
  Controller,
  Get,
  Post,
  Delete,
} from '@nestjs/common';

import { CacheService } from './cache.service.js';

@Controller('cache-test')
export class CacheTestController {
  constructor(private readonly cache: CacheService) {}

  @Post()
  async create() {
    const data = {
      id: '123',
      name: 'Nurlikum Uran',
      type: 'ORGANIZATION',
    };

    await this.cache.set(
      'katbr:test:organization:123',
      data,
      300,
    );

    return {
      message: 'Cache successfully created',
      data,
    };
  }

  @Get()
  async find() {
    const data = await this.cache.get(
      'katbr:test:organization:123',
    );

    return {
      cache: data ? 'HIT' : 'MISS',
      data,
    };
  }

  @Get('ttl')
  async ttl() {
    return {
      ttl: await this.cache.getTTL(
        'katbr:test:organization:123',
      ),
    };
  }

  @Delete()
  async remove() {
    await this.cache.delete(
      'katbr:test:organization:123',
    );

    return {
      message: 'Cache deleted',
    };
  }
}