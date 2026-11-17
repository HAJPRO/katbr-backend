
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

import { RolePermissionsService } from './role-permissions.service.js';
import { AssignPermissionDto } from './dto/assign-permission.dto.js';

@ApiTags('Role Permissions')
@ApiBearerAuth()
@Controller({
  path: 'roles/:roleId/permissions',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Assign permission to role' })
  assign(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() dto: AssignPermissionDto,
  ) {
    return this.rolePermissionsService.assign(roleId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get role permissions' })
  findAll(
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.rolePermissionsService.findAll(roleId);
  }

  @Delete(':permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  remove(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.rolePermissionsService.remove(
      roleId,
      permissionId,
    );
  }
}
