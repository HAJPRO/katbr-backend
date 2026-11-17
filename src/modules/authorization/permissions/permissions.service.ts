
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service.js';

import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { QueryPermissionsDto } from './dto/query-permissions.dto.js';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreatePermissionDto) {
    try {
      return await this.prisma.permission.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          module: dto.module,
        },
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Permission with this code already exists',
        );
      }

      throw error;
    }
  }

  async findAll(query: QueryPermissionsDto) {
    const {
      page = 1,
      limit = 20,
      search,
      module,
      isActive,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      ...(search
        ? {
            OR: [
              {
                code: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                name: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),

      ...(module ? { module } : {}),

      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { module: 'asc' },
          { code: 'asc' },
        ],
        include: {
          _count: {
            select: {
              rolePermissions: true,
              userPermissions: true,
            },
          },
        },
      }),

      this.prisma.permission.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                code: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        userPermissions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto) {
    await this.ensureExists(id);

    return this.prisma.permission.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const permission = await this.ensureExists(id);

    if (!permission.isActive) {
      return {
        message: 'Permission is already inactive',
      };
    }

    await this.prisma.permission.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return {
      message: 'Permission deactivated successfully',
    };
  }

  private async ensureExists(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }
}
