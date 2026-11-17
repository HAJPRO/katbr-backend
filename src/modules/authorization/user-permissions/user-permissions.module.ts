
import { Module } from '@nestjs/common';

import { UserPermissionsController } from './user-permissions.controller.js';
import { UserPermissionsService } from './user-permissions.service.js';

@Module({
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService],
  exports: [UserPermissionsService],
})
export class UserPermissionsModule {}
