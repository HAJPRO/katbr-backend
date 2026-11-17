
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service.js';
import { CreateBrokerDto } from './dto/create-broker.dto.js';

@Injectable()
export class BrokersService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Broker yaratish
  async create(dto: CreateBrokerDto) {
    return this.prisma.broker.create({
      data: {
        name: dto.name,
      },
    });
  }

  // 2. Barcha brokerlarni olish
  async findAll() {
    return this.prisma.broker.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        organizations: {
          include: {
            organization: true,
          },
        },
      },
    });
  }

  // 3. Brokerga tashkilot biriktirish
  async assignOrganization(
    brokerId: string,
    organizationId: string,
  ) {
    const broker = await this.prisma.broker.findUnique({
      where: { id: brokerId },
    });

    if (!broker) {
      throw new NotFoundException('Broker not found');
    }

    const organization =
      await this.prisma.organization.findUnique({
        where: { id: organizationId },
      });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const existing =
      await this.prisma.organizationBroker.findUnique({
        where: {
          organizationId_brokerId: {
            organizationId,
            brokerId,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'Broker is already assigned to this organization',
      );
    }

    return this.prisma.organizationBroker.create({
      data: {
        broker: {
          connect: { id: brokerId },
        },
        organization: {
          connect: { id: organizationId },
        },
      },
      include: {
        broker: true,
        organization: true,
      },
    });
    
    
  }

async disconnectOrganization(
  brokerId: string,
  organizationId: string,
) {
  const relation =
    await this.prisma.organizationBroker.findUnique({
      where: {
        organizationId_brokerId: {
          organizationId,
          brokerId,
        },
      },
    });

  if (!relation) {
    throw new NotFoundException(
      'Broker organization relation not found',
    );
  }

  return this.prisma.organizationBroker.delete({
    where: {
      organizationId_brokerId: {
        organizationId,
        brokerId,
      },
    },
  });
}


async disconnectAllOrganizations(brokerId: string) {
  const broker = await this.prisma.broker.findUnique({
    where: { id: brokerId },
  });

  if (!broker) {
    throw new NotFoundException('Broker not found');
  }

  const result = await this.prisma.organizationBroker.deleteMany({
    where: {
      brokerId,
    },
  });

  return {
    message: 'All organization assignments removed',
    brokerId,
    deletedCount: result.count,
  };
}


async upsertOrganization(
  brokerId: string,
  organizationId: string,
) {
  // Broker mavjudligini tekshirish
  const broker = await this.prisma.broker.findUnique({
    where: { id: brokerId },
  });

  if (!broker) {
    throw new NotFoundException('Broker not found');
  }

  // Organization mavjudligini tekshirish
  const organization =
    await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

  if (!organization) {
    throw new NotFoundException('Organization not found');
  }

  // Upsert
  return this.prisma.organizationBroker.upsert({
    where: {
      organizationId_brokerId: {
        organizationId,
        brokerId,
      },
    },

    update: {
      assignedAt: new Date(),
    },

    create: {
      broker: {
        connect: { id: brokerId },
      },
      organization: {
        connect: { id: organizationId },
      },
    },

    include: {
      broker: true,
      organization: true,
    },
  });
}


async createAndAssignBroker(
  organizationId: string,
  dto: CreateBrokerDto,
) {
  return this.prisma.$transaction(async (tx) => {
    // 1. Broker yaratamiz
    const broker = await tx.broker.create({
      data: {
        name: dto.name,
      },
    });

    // 2. Organization mavjudligini tekshiramiz
    const organization = await tx.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // 3. Broker va Organization'ni bog'laymiz
    const assignment = await tx.organizationBroker.create({
      data: {
        brokerId: broker.id,
        organizationId: organization.id,
      },
      include: {
        broker: true,
        organization: true,
      },
    });

    // 4. Natijani qaytaramiz
    return assignment;
  });
}


}
