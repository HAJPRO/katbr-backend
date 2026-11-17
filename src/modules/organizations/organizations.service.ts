
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { CreateLotDto } from '../lots/dto/create-lot.dto.js';
@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Organization already exists',
      );
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name,
      },
    });
  }
async createOrganizationLot(
  id: string,
  dto: CreateLotDto,
) {
  const organization = await this.prisma.organization.findUnique({
    where: { id },
  });

  if (!organization) {
    throw new NotFoundException(
      `Organization ${id} not found`,
    );
  }

  return this.prisma.lot.create({
    data: {
      name: dto.name,
      quantity: dto.quantity,

      organization: {
        connect: {
          id: organization.id,
        },
      },
    },
    include: {
      organization: true,
    },
  });
}
  async findAll() {
    return this.prisma.organization.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organization ${id} not found`,
      );
    }

    return organization;
  }

  async findOrganizationLots(id: string) {
  const organization = await this.prisma.organization.findUnique({
    where: { id },
    include: {
      lots: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!organization) {
    throw new NotFoundException(
      `Organization ${id} not found`,
    );
  }

  return organization;
}

async findOrganizationLotNames(id: string) {
  const organization = await this.prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      lots: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!organization) {
    throw new NotFoundException(
      `Organization ${id} not found`,
    );
  }

  return organization;
}



}
