
import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Version
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { BrokersService } from './brokers.service.js';
import { CreateBrokerDto } from './dto/create-broker.dto.js';

@ApiTags('Brokers')
@ApiBearerAuth()
@Controller({
  path: 'brokers',
  version: '1',
})
export class BrokersController {
  constructor(
    private readonly brokersService: BrokersService,
  ) {}

  // ==========================================
  // 1. Create Broker
  // POST /api/brokers
  // ==========================================

  @Post()
  @ApiOperation({
    summary: 'Create broker',
    description: 'Create a new broker in the KATBR platform.',
  })
  @ApiBody({
    type: CreateBrokerDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Broker created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid broker data',
  })
  async create(
    @Body() dto: CreateBrokerDto,
  ) {
    return this.brokersService.create(dto);
  }

  // ==========================================
  // 2. Get All Brokers
  // GET /api/brokers
  // ==========================================

  @Get()
  @ApiOperation({
    summary: 'Get all brokers',
    description: 'Retrieve all registered brokers.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Brokers retrieved successfully',
  })
  async findAll() {
    return this.brokersService.findAll();
  }

  // ==========================================
  // 3. Assign Organization to Broker
  // POST /api/brokers/:brokerId/organizations/:organizationId
  // ==========================================

  @Post(':brokerId/organizations/:organizationId')
  @ApiOperation({
    summary: 'Assign organization to broker',
    description:
      'Assign an existing organization to an existing broker.',
  })
  @ApiParam({
    name: 'brokerId',
    type: String,
    format: 'uuid',
    description: 'Broker UUID',
  })
  @ApiParam({
    name: 'organizationId',
    type: String,
    format: 'uuid',
    description: 'Organization UUID',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Organization assigned to broker successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID or assignment data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Broker or organization not found',
  })
  async assignOrganization(
    @Param('brokerId', ParseUUIDPipe) brokerId: string,
    @Param('organizationId', ParseUUIDPipe)
    organizationId: string,
  ) {
    return this.brokersService.assignOrganization(
      brokerId,
      organizationId,
    );
  }

  // ==========================================
  // 4. Disconnect Organization
  // DELETE /api/brokers/:brokerId/organizations/:organizationId
  // ==========================================

  @Delete(':brokerId/organizations/:organizationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disconnect organization from broker',
    description:
      'Remove the relationship between a broker and an organization.',
  })
  @ApiParam({
    name: 'brokerId',
    type: String,
    format: 'uuid',
    description: 'Broker UUID',
  })
  @ApiParam({
    name: 'organizationId',
    type: String,
    format: 'uuid',
    description: 'Organization UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization disconnected successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Broker, organization or relationship not found',
  })
  async disconnectOrganization(
    @Param('brokerId', ParseUUIDPipe) brokerId: string,
    @Param('organizationId', ParseUUIDPipe)
    organizationId: string,
  ) {
    return this.brokersService.disconnectOrganization(
      brokerId,
      organizationId,
    );
  }

  // ==========================================
  // 5. Disconnect All Organizations
  // DELETE /api/brokers/:brokerId/organizations
  // ==========================================

  @Delete(':brokerId/organizations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disconnect all organizations',
    description:
      'Remove all organization relationships associated with a broker.',
  })
  @ApiParam({
    name: 'brokerId',
    type: String,
    format: 'uuid',
    description: 'Broker UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All organizations disconnected successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Broker not found',
  })
  async disconnectAllOrganizations(
    @Param('brokerId', ParseUUIDPipe) brokerId: string,
  ) {
    return this.brokersService.disconnectAllOrganizations(
      brokerId,
    );
  }

  // ==========================================
  // 6. Upsert Organization Relationship
  // PUT /api/brokers/:brokerId/organizations/:organizationId
  // ==========================================

  @Put(':brokerId/organizations/:organizationId')
  @ApiOperation({
    summary: 'Upsert broker organization relationship',
    description:
      'Create the relationship if it does not exist, or update it if it already exists.',
  })
  @ApiParam({
    name: 'brokerId',
    type: String,
    format: 'uuid',
    description: 'Broker UUID',
  })
  @ApiParam({
    name: 'organizationId',
    type: String,
    format: 'uuid',
    description: 'Organization UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relationship created or updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Broker or organization not found',
  })
  async upsertOrganization(
    @Param('brokerId', ParseUUIDPipe) brokerId: string,
    @Param('organizationId', ParseUUIDPipe)
    organizationId: string,
  ) {
    return this.brokersService.upsertOrganization(
      brokerId,
      organizationId,
    );
  }

  // ==========================================
  // 7. Create Broker and Assign Organization
  // POST /api/brokers/create-and-assign/:organizationId
  // ==========================================

  @Post('create-and-assign/:organizationId')
  @ApiOperation({
    summary: 'Create broker and assign organization',
    description:
      'Create a new broker and assign an existing organization to it.',
  })
  @ApiParam({
    name: 'organizationId',
    type: String,
    format: 'uuid',
    description: 'Organization UUID',
  })
  @ApiBody({
    type: CreateBrokerDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Broker created and organization assigned successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid broker data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
  })
  async createAndAssignBroker(
    @Param('organizationId', ParseUUIDPipe)
    organizationId: string,
    @Body() dto: CreateBrokerDto,
  ) {
    return this.brokersService.createAndAssignBroker(
      organizationId,
      dto,
    );
  }
}
