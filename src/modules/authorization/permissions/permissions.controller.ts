
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

import { PermissionsService } from './permissions.service.js';

import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { QueryPermissionsDto } from './dto/query-permissions.dto.js';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller({
  path: 'permissions',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create permission' })
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  findAll(@Query() query: QueryPermissionsDto) {
    return this.permissionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate permission' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.permissionsService.remove(id);
  }
}
