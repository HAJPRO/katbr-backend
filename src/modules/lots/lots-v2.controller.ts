
import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseInterceptors,
  UseFilters,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

import { LotsService } from './lots.service.js';
import { QueryLotsDto } from './dto/query-lots.dto.js';
import { CreateLotV2Dto } from './dto/v2/create-lot-v2.dto.js';

import { ResponseInterceptor } from '../../common/interceptors/response/response.interceptor.js';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter.js';

@ApiTags('Lots V2')
@Controller({
  path: 'lots',
  version: '2',
})
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class LotsV2Controller {
  constructor(
    private readonly lotsService: LotsService,
  ) {}

  // ==========================================
  // 1. Get All Lots - V2
  // GET /api/v2/lots
  // ==========================================

  @Get()
  @ApiOperation({
    summary: 'Get all lots - V2',
    description:
      'Retrieve lots with filtering, searching and pagination using API V2.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lots retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query parameters',
  })
  async findAll(
    @Query() query: QueryLotsDto,
  ) {
    const result = await this.lotsService.findAll(query);

    return {
      apiVersion: '2',
      data: result,
      metadata: {
        version: 'v2',
      },
    };
  }

  // ==========================================
  // 2. Create Lot - V2
  // POST /api/v2/lots
  // ==========================================

  @Post()
  @ApiOperation({
    summary: 'Create lot - V2',
    description:
      'Create a new lot using the V2 request contract.',
  })
  @ApiBody({
    type: CreateLotV2Dto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lot created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid lot data',
  })
  async create(
    @Body() dto: CreateLotV2Dto,
  ) {
    const result = await this.lotsService.create({
      name: dto.title,
      quantity: dto.quantity,
    });

    return {
      apiVersion: '2',
      data: result,
      metadata: {
        version: 'v2',
      },
    };
  }
}
