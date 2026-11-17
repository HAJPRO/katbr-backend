
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

import { UserPermissionsService } from './user-permissions.service.js';

import { AssignUserPermissionDto } from './dto/assign-user-permission.dto.js';
import { UpdateUserPermissionDto } from './dto/update-user-permission.dto.js';

@ApiTags('User Permissions')
@ApiBearerAuth()
@Controller({
  path: 'users/:userId/permissions',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsService: UserPermissionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Assign direct permission to user' })
  assign(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignUserPermissionDto,
  ) {
    return this.userPermissionsService.assign(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get direct user permissions' })
  findAll(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.userPermissionsService.findAll(userId);
  }

  @Patch(':permissionId')
  @ApiOperation({ summary: 'Update direct permission effect' })
  update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
    @Body() dto: UpdateUserPermissionDto,
  ) {
    return this.userPermissionsService.update(
      userId,
      permissionId,
      dto,
    );
  }

  @Delete(':permissionId')
  @ApiOperation({ summary: 'Remove direct user permission' })
  remove(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return this.userPermissionsService.remove(
      userId,
      permissionId,
    );
  }
}
