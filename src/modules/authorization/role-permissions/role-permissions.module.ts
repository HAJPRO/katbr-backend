
import { Module } from '@nestjs/common';

import { RolePermissionsController } from './role-permissions.controller.js';
import { RolePermissionsService } from './role-permissions.service.js';

@Module({
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
  exports: [RolePermissionsService],
})
export class RolePermissionsModule {}
