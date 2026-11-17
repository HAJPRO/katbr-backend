
import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service.js';
import { AssignPermissionDto } from './dto/assign-permission.dto.js';

@Injectable()
export class RolePermissionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async assign(roleId: string, dto: AssignPermissionDto) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!role.isActive) {
      throw new BadRequestException('Cannot assign permission to an inactive role');
    }

    const permission = await this.prisma.permission.findUnique({
      where: { id: dto.permissionId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (!permission.isActive) {
      throw new BadRequestException('Cannot assign an inactive permission');
    }

    try {
      return await this.prisma.rolePermission.create({
        data: {
          roleId,
          permissionId: dto.permissionId,
        },
        include: {
          role: {
            select: {
              id: true,
              code: true,
              name: true,
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
          'This permission is already assigned to the role',
        );
      }

      throw error;
    }
  }

  async findAll(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permissions = await this.prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        permission: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      role,
      total: permissions.length,
      permissions,
    };
  }

  async remove(roleId: string, permissionId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const assignment = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Permission assignment not found for this role',
      );
    }

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return {
      message: 'Permission removed from role successfully',
    };
  }
}
