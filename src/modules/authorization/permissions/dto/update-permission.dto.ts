
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
