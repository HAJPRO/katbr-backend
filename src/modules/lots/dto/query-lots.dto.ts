
import { Type } from 'class-transformer';

import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsEnum,
  IsIn,
  IsString,
  MaxLength,
  IsNumber,
  IsDateString,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { LotStatus } from '../../../generated/prisma/enums.js';

export class QueryLotsDto {
  // Pagination: page number
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    type: Number,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  // Pagination: items per page
  @ApiPropertyOptional({
    description: 'Number of records per page',
    example: 20,
    type: Number,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  // Filter by lot status
  @ApiPropertyOptional({
    description: 'Filter lots by status',
    enum: LotStatus,
    example: LotStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(LotStatus)
  status?: LotStatus;

  // Search by lot name
  @ApiPropertyOptional({
    description: 'Search lots by name',
    example: 'Crude Oil',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  search?: string;

  // Minimum quantity filter
  @ApiPropertyOptional({
    description: 'Minimum lot quantity',
    example: 100,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  // Maximum quantity filter
  @ApiPropertyOptional({
    description: 'Maximum lot quantity',
    example: 5000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  // Date range: from
  @ApiPropertyOptional({
    description: 'Filter lots created from this date',
    example: '2026-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  // Date range: to
  @ApiPropertyOptional({
    description: 'Filter lots created until this date',
    example: '2026-12-31T23:59:59.999Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  // Sorting field
  @ApiPropertyOptional({
    description: 'Field used to sort lots',
    example: 'createdAt',
    enum: ['createdAt', 'quantity'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'quantity'])
  sortBy: 'createdAt' | 'quantity' = 'createdAt';

  // Sorting direction
  @ApiPropertyOptional({
    description: 'Sorting direction',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
