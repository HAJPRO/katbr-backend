
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateLotDto {
  @ApiProperty({
    description: 'Lot name',
    example: 'Crude Oil - Lot 001',
    type: String,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'Lot quantity',
    example: 1500.5,
    type: Number,
    minimum: 0.001,
  })
  @IsNumber()
  @Min(0.001)
  quantity: number;
}
