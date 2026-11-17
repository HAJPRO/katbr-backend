
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
  UseFilters,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { LotsService } from './lots.service.js';
import { CreateLotDto } from './dto/create-lot.dto.js';
import { UpdateLotDto } from './dto/update-lot.dto.js';
import { QueryLotsDto } from './dto/query-lots.dto.js';

import { ResponseInterceptor } from '../../common/interceptors/response/response.interceptor.js';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter.js';

@ApiTags('Lots')
@ApiBearerAuth()
@Controller({
  path: 'lots',
  version: '1',
})
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class LotsController {
  constructor(
    private readonly lotsService: LotsService,
  ) {}

  // ==========================================
  // 1. Get All Lots
  // GET /api/lots
  // ==========================================

  @Get()
  @ApiOperation({
    summary: 'Get all lots',
    description:
      'Retrieve lots with optional filtering, searching and pagination.',
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
    return this.lotsService.findAll(query);
  }

  // ==========================================
  // 2. Get Lot By ID
  // GET /api/lots/:id
  // ==========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get lot by ID',
    description: 'Retrieve detailed information about a specific lot.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lot ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lot retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lot not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid lot ID',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lotsService.findOne(id);
  }

  // ==========================================
  // 3. Create Lot
  // POST /api/lots
  // ==========================================

  @Post()
  @ApiOperation({
    summary: 'Create lot',
    description: 'Create a new lot in the KATBR platform.',
  })
  @ApiBody({
    type: CreateLotDto,
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
    @Body() dto: CreateLotDto,
  ) {
    return this.lotsService.create(dto);
  }

  // ==========================================
  // 4. Update Lot
  // PATCH /api/lots/:id
  // ==========================================

  @Patch(':id')
  @ApiOperation({
    summary: 'Update lot',
    description: 'Partially update an existing lot.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lot ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateLotDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lot updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lot not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLotDto,
  ) {
    return this.lotsService.update(id, dto);
  }

  // ==========================================
  // 5. Delete Lot
  // DELETE /api/lots/:id
  // ==========================================

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete lot',
    description: 'Delete a lot by its ID.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lot ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lot deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lot not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid lot ID',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lotsService.remove(id);
  }

  // ==========================================
  // 6. Disconnect Organization
  // PATCH /api/lots/:id/disconnect-organization
  // ==========================================

  @Patch(':id/disconnect-organization')
  @ApiOperation({
    summary: 'Disconnect organization from lot',
    description:
      'Remove the organization relationship associated with a lot.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Lot ID',
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization disconnected successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lot not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid lot ID',
  })
  async disconnectOrganization(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.lotsService.disconnectOrganization(id);
  }
}
