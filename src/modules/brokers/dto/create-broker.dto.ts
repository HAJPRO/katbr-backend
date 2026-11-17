
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateBrokerDto {
  @ApiProperty({
    description: 'Broker name',
    example: 'Vektor Brokerage LLC',
    type: String,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;
}
