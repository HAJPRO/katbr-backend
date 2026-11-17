
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  Version,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { CreateLotDto } from '../lots/dto/create-lot.dto.js';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller({
  path: 'organizations',
  version: '1',
})
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  // ==========================================
  // 1. Create Organization
  // POST /api/organizations
  // ==========================================

  @Post()
  @ApiOperation({
    summary: 'Create organization',
    description:
      'Register a new organization in the KATBR platform.',
  })
  @ApiBody({
    type: CreateOrganizationDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid organization data',
  })
  async create(
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(dto);
  }

  // ==========================================
  // 2. Get All Organizations
  // GET /api/organizations
  // ==========================================

  @Get()
  @ApiOperation({
    summary: 'Get all organizations',
    description:
      'Retrieve all registered organizations.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organizations retrieved successfully',
  })
  async findAll() {
    return this.organizationsService.findAll();
  }

  // ==========================================
  // 3. Get Organization Lots
  // GET /api/organizations/:id/lots
  // ==========================================

  @Get(':id/lots')
  @ApiOperation({
    summary: 'Get organization lots',
    description:
      'Retrieve all lots associated with a specific organization.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Organization UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization lots retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid organization UUID',
  })
  async findOrganizationLots(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.organizationsService.findOrganizationLots(id);
  }

  // ==========================================
  // 4. Get Organization By ID
  // GET /api/organizations/:id
  // ==========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get organization by ID',
    description:
      'Retrieve detailed information about a specific organization.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Organization UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid organization UUID',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.organizationsService.findOne(id);
  }

  // ==========================================
  // 5. Get Organization Lot Names
  // GET /api/organizations/:id/lot-names
  // ==========================================

  @Get(':id/lot-names')
  @ApiOperation({
    summary: 'Get organization lot names',
    description:
      'Retrieve the names of lots associated with an organization.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Organization UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization lot names retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid organization UUID',
  })
  async findOrganizationLotNames(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.organizationsService.findOrganizationLotNames(id);
  }

  // ==========================================
  // 6. Create Lot For Organization
  // POST /api/organizations/:id/lots
  // ==========================================

  @Post(':id/lots')
  @ApiOperation({
    summary: 'Create lot for organization',
    description:
      'Create a new lot and associate it with an existing organization.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Organization UUID',
  })
  @ApiBody({
    type: CreateLotDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization lot created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid lot data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  async createOrganizationLot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateLotDto,
  ) {
    return this.organizationsService.createOrganizationLot(
      id,
      dto,
    );
  }
}
