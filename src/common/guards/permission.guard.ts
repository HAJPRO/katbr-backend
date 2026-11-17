
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PrismaService } from '../../database/prisma.service.js';
import { PERMISSIONS_KEY } from '../decorators/RequirePermissions.decorator.js';
import { PermissionEffect } from '../../generated/prisma/client.js';

interface AuthenticatedUser {
  id: string;
  email: string;
}

interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const permissions = await this.prisma.permission.findMany({
      where: {
        code: {
          in: requiredPermissions,
        },
        isActive: true,
      },
      select: {
        id: true,
        code: true,
      },
    });

    if (permissions.length !== new Set(requiredPermissions).size) {
      throw new ForbiddenException('Required permission is unavailable');
    }

    const permissionIds = permissions.map(
      (permission) => permission.id,
    );

    // 1. Foydalanuvchining bevosita GRANT/DENY ruxsatlari
    const directPermissions =
      await this.prisma.userPermission.findMany({
        where: {
          userId: user.id,
          permissionId: {
            in: permissionIds,
          },
        },
        select: {
          permissionId: true,
          effect: true,
        },
      });

    // 2. Foydalanuvchining faol rollari orqali kelgan ruxsatlar
    const roleAssignments =
      await this.prisma.userRoleAssignment.findMany({
        where: {
          userId: user.id,
          role: {
            isActive: true,
          },
        },
        select: {
          role: {
            select: {
              permissions: {
                where: {
                  permissionId: {
                    in: permissionIds,
                  },
                  permission: {
                    isActive: true,
                  },
                },
                select: {
                  permissionId: true,
                },
              },
            },
          },
        },
      });

    const directPermissionMap = new Map(
      directPermissions.map((item) => [
        item.permissionId,
        item.effect,
      ]),
    );

    const rolePermissionIds = new Set<string>();

    for (const assignment of roleAssignments) {
      for (const rolePermission of assignment.role.permissions) {
        rolePermissionIds.add(rolePermission.permissionId);
      }
    }

    // 3. Har bir talab qilingan permission alohida tekshiriladi
    const hasAllPermissions = permissions.every((permission) => {
      const directEffect = directPermissionMap.get(permission.id);

      // DENY har qanday GRANT'dan ustun
      if (directEffect === PermissionEffect.DENY) {
        return false;
      }

      // Bevosita GRANT
      if (directEffect === PermissionEffect.GRANT) {
        return true;
      }

      // Role orqali berilgan GRANT
      return rolePermissionIds.has(permission.id);
    });

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'You do not have the required permissions',
      );
    }

    return true;
  }
}
