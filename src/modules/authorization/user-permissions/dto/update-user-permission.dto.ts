
import { IsEnum } from 'class-validator';

import { PermissionEffect } from '../../../../generated/prisma/client.js';

export class UpdateUserPermissionDto {
  @IsEnum(PermissionEffect)
  effect: PermissionEffect;
}
