
import {
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Organization legal or registered name',
    example: 'Vektor Textile LLC',
    type: String,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;
}
