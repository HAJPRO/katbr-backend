
import { Module } from '@nestjs/common';

import { RolesModule } from './roles/roles.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { RolePermissionsModule } from './role-permissions/role-permissions.module.js';
import { UserRolesModule } from './user-roles/user-roles.module.js';
import { UserPermissionsModule } from './user-permissions/user-permissions.module.js';

@Module({
  imports: [
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserRolesModule,
    UserPermissionsModule,
  ],
  exports: [
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserRolesModule,
    UserPermissionsModule,
  ],
})
export class AuthorizationModule {}
