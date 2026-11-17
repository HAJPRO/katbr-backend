
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service.js';

import { AssignUserPermissionDto } from './dto/assign-user-permission.dto.js';
import { UpdateUserPermissionDto } from './dto/update-user-permission.dto.js';

@Injectable()
export class UserPermissionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async assign(userId: string, dto: AssignUserPermissionDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isActive) {
      throw new BadRequestException(
        'Cannot assign permission to an inactive user',
      );
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: dto.permissionId },
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (!permission.isActive) {
      throw new BadRequestException(
        'Cannot assign an inactive permission',
      );
    }

    try {
      return await this.prisma.userPermission.create({
        data: {
          userId,
          permissionId: dto.permissionId,
          effect: dto.effect,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          permission: {
            select: {
              id: true,
              code: true,
              name: true,
              module: true,
            },
          },
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
          'A direct permission assignment already exists for this user',
        );
      }

      throw error;
    }
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const assignments = await this.prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: {
          select: {
            id: true,
            code: true,
            name: true,
            module: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      user,
      total: assignments.length,
      permissions: assignments,
    };
  }

  async update(
    userId: string,
    permissionId: string,
    dto: UpdateUserPermissionDto,
  ) {
    const assignment = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Direct permission assignment not found',
      );
    }

    return this.prisma.userPermission.update({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      data: {
        effect: dto.effect,
      },
      include: {
        permission: {
          select: {
            id: true,
            code: true,
            name: true,
            module: true,
          },
        },
      },
    });
  }

  async remove(userId: string, permissionId: string) {
    const assignment = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Direct permission assignment not found',
      );
    }

    await this.prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
    });

    return {
      message: 'Direct permission assignment removed successfully',
    };
  }
}
