
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/, {
    message: 'Code must use format: module.action, e.g. users.read',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Module must contain lowercase letters, numbers or underscores',
  })
  module: string;
}
