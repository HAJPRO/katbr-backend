
import {
  IsEnum,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

import { PermissionEffect } from '../../../../generated/prisma/client.js';

export class AssignUserPermissionDto {
  @IsUUID()
  @IsNotEmpty()
  permissionId: string;

  @IsEnum(PermissionEffect)
  effect: PermissionEffect;
}
