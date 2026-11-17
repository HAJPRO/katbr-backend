
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import { RequirePermissions } from '../../common/decorators/RequirePermissions.decorator.js';

import { PermissionGuard } from '../../common/guards/permission.guard.js';

@ApiTags('RBAC Test')
@ApiBearerAuth()
@Controller({
  path: 'rbac-test',
  version: '1',
})
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RbacTestController {
  @Get('admin')
  @RequirePermissions('admin.access')
  adminOnly() {
    return {
      message: 'Welcome, administrator!',
    };
  }

  @Get('manager')
  @RequirePermissions('reports.read')
  managerOnly() {
    return {
      message: 'Welcome, manager!',
    };
  }

  @Get('viewer')
  @RequirePermissions('dashboard.read')
  viewerAccessible() {
    return {
      message: 'You can access this resource.',
    };
  }
}
