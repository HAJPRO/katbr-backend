
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async assign(userId: string, dto: AssignRoleDto) {
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
        'Cannot assign a role to an inactive user',
      );
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
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

    if (!role.isActive) {
      throw new BadRequestException(
        'Cannot assign an inactive role',
      );
    }

    try {
      return await this.prisma.userRoleAssignment.create({
        data: {
          userId,
          roleId: dto.roleId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          role: {
            select: {
              id: true,
              code: true,
              name: true,
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
          'This role is already assigned to the user',
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

    const assignments =
      await this.prisma.userRoleAssignment.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              _count: {
                select: {
                  permissions: true,
                },
              },
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
      });

    return {
      user,
      total: assignments.length,
      roles: assignments,
    };
  }

  async remove(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const assignment =
      await this.prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        select: {
          id: true,
        },
      });

    if (!assignment) {
      throw new NotFoundException(
        'Role assignment not found for this user',
      );
    }

    await this.prisma.userRoleAssignment.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    return {
      message: 'Role removed from user successfully',
    };
  }
}
