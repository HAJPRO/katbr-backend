
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service.js';

import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { QueryRolesDto } from './dto/query-roles.dto.js';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // CREATE
  async create(dto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
        },
      });
    } catch (error) {
      if (this.getPrismaErrorCode(error) === 'P2002') {
        throw new ConflictException(
          'Role code already exists',
        );
      }

      throw error;
    }
  }

  // READ ALL
  async findAll(query: QueryRolesDto) {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      ...(typeof isActive === 'boolean' && { isActive }),

      ...(search && {
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
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              userAssignments: true,
              permissions: true,
            },
          },
        },
      }),

      this.prisma.role.count({ where }),
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

  // READ ONE
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },

      include: {
        permissions: {
          include: {
            permission: true,
          },
        },

        _count: {
          select: {
            userAssignments: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  // UPDATE
  async update(id: string, dto: UpdateRoleDto) {
    await this.ensureRoleExists(id);

    try {
      return await this.prisma.role.update({
        where: { id },

        data: {
          ...(dto.name !== undefined && {
            name: dto.name,
          }),

          ...(dto.description !== undefined && {
            description: dto.description,
          }),

          ...(dto.isActive !== undefined && {
            isActive: dto.isActive,
          }),
        },
      });
    } catch (error) {
      if (this.getPrismaErrorCode(error) === 'P2025') {
        throw new NotFoundException('Role not found');
      }

      throw error;
    }
  }

  // DELETE / SOFT DELETE
  async remove(id: string) {
    const role = await this.ensureRoleExists(id);

    if (role.isSystem) {
      throw new ConflictException(
        'System roles cannot be deleted',
      );
    }

    if (!role.isActive) {
      throw new ConflictException(
        'Role is already deactivated',
      );
    }

    return this.prisma.role.update({
      where: { id },

      data: {
        isActive: false,
      },
    });
  }

  // CHECK ROLE
  private async ensureRoleExists(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  // PRISMA ERROR CODE
  private getPrismaErrorCode(
    error: unknown,
  ): string | undefined {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
    ) {
      return error.code;
    }

    return undefined;
  }
}
