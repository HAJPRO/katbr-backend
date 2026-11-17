
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

import { UserRolesService } from './user-roles.service.js';
import { AssignRoleDto } from './dto/assign-role.dto.js';

@ApiTags('User Roles')
@ApiBearerAuth()
@Controller({
  path: 'users/:userId/roles',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class UserRolesController {
  constructor(
    private readonly userRolesService: UserRolesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Assign role to user' })
  assign(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.userRolesService.assign(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user roles' })
  findAll(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.userRolesService.findAll(userId);
  }

  @Delete(':roleId')
  @ApiOperation({ summary: 'Remove role from user' })
  remove(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.userRolesService.remove(userId, roleId);
  }
}
