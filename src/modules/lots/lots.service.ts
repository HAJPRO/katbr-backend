import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';
import { CacheService } from '../cache/cache.service.js';

import { CreateLotDto } from './dto/create-lot.dto.js';
import { UpdateLotDto } from './dto/update-lot.dto.js';
import { QueryLotsDto } from './dto/query-lots.dto.js';

@Injectable()
export class LotsService {
  private readonly CACHE_PREFIX = 'katbr:lots';
  private readonly LIST_TTL = 60;
  private readonly DETAIL_TTL = 120;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  // Cache key generator
  private getDetailCacheKey(id: number): string {
    return `${this.CACHE_PREFIX}:detail:${id}`;
  }

  private getListCacheKey(query: QueryLotsDto): string {
    const normalizedQuery = {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      status: query.status ?? null,
      search: query.search ?? null,
      minQuantity: query.minQuantity ?? null,
      maxQuantity: query.maxQuantity ?? null,
      dateFrom: query.dateFrom ?? null,
      dateTo: query.dateTo ?? null,
      sortBy: query.sortBy ?? 'createdAt',
      sortOrder: query.sortOrder ?? 'desc',
    };

    return `${this.CACHE_PREFIX}:list:${JSON.stringify(normalizedQuery)}`;
  }

  // Cache invalidation
  private async invalidateListCache(): Promise<void> {
    await this.cache.deleteByPattern(
      `${this.CACHE_PREFIX}:list:*`,
    );
  }

  private async invalidateLotCache(id: number): Promise<void> {
    await Promise.all([
      this.cache.delete(this.getDetailCacheKey(id)),
      this.invalidateListCache(),
    ]);
  }

  // READ ALL
  async findAll(query: QueryLotsDto) {
    const cacheKey = this.getListCacheKey(query);

    // 1. Redis'dan tekshirish
    const cached = await this.cache.get(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const {
      page = 1,
      limit = 20,
      status,
      search,
      minQuantity,
      maxQuantity,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where = {
      ...(status ? { status } : {}),

      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }
        : {}),

      ...(minQuantity !== undefined || maxQuantity !== undefined
        ? {
            quantity: {
              ...(minQuantity !== undefined
                ? { gte: minQuantity }
                : {}),
              ...(maxQuantity !== undefined
                ? { lte: maxQuantity }
                : {}),
            },
          }
        : {}),

      ...(dateFrom !== undefined || dateTo !== undefined
        ? {
            createdAt: {
              ...(dateFrom !== undefined
                ? { gte: new Date(dateFrom) }
                : {}),
              ...(dateTo !== undefined
                ? { lte: new Date(dateTo) }
                : {}),
            },
          }
        : {}),
    };

    // 2. Cache MISS: PostgreSQL'dan olish
    const [data, total] = await Promise.all([
      this.prisma.lot.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      this.prisma.lot.count({ where }),
    ]);

    const result = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };

    // 3. Natijani Redis'ga yozish
    await this.cache.set(
      cacheKey,
      result,
      this.LIST_TTL,
    );

    return result;
  }

  // READ ONE
  async findOne(id: number) {
    const cacheKey = this.getDetailCacheKey(id);

    // 1. Redis'dan tekshirish
    const cached = await this.cache.get(cacheKey);

    if (cached !== null) {
      return cached;
    }

    // 2. Cache MISS: PostgreSQL'dan olish
    const lot = await this.prisma.lot.findUnique({
      where: { id },
    });

    if (!lot) {
      throw new NotFoundException(
        `Lot with ID ${id} not found`,
      );
    }

    // 3. Redis'ga yozish
    await this.cache.set(
      cacheKey,
      lot,
      this.DETAIL_TTL,
    );

    return lot;
  }

  // CREATE
  async create(dto: CreateLotDto) {
    const lot = await this.prisma.lot.create({
      data: {
        name: dto.name,
        quantity: dto.quantity,
      },
    });

    await this.invalidateListCache();

    return lot;
  }

  // UPDATE
  async update(id: number, dto: UpdateLotDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided',
      );
    }

    await this.findOne(id);

    const lot = await this.prisma.lot.update({
      where: { id },
      data: dto,
    });

    await this.invalidateLotCache(id);

    return lot;
  }

  // DELETE
  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.lot.delete({
      where: { id },
    });

    await this.invalidateLotCache(id);

    return {
      message: `Lot ${id} successfully deleted`,
    };
  }

  // DISCONNECT ORGANIZATION
  async disconnectOrganization(id: number) {
    await this.findOne(id);

    const lot = await this.prisma.lot.update({
      where: { id },
      data: {
        organization: {
          disconnect: true,
        },
      },
      include: {
        organization: true,
      },
    });

    await this.invalidateLotCache(id);

    return lot;
  }
}