
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { LotsService } from './lots.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { QueryLotsDto } from './dto/query-lots.dto.js';
describe('LotsService', () => {
  let service: LotsService;

  // PrismaService Mock
  const prismaMock = {
    lot: {
     create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          LotsService,
          {
            provide: PrismaService,
            useValue: prismaMock,
          },
        ],
      }).compile();

    service = module.get<LotsService>(LotsService);
  });

  describe('create', () => {
    it('should create a lot successfully', async () => {
      // Arrange
      const dto = {
        name: 'Crude Oil',
        quantity: 1500,
      };

      const expectedResult = {
        id: 1,
        name: 'Crude Oil',
        quantity: 1500,
      };

      prismaMock.lot.create.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(expectedResult);

      expect(prismaMock.lot.create).toHaveBeenCalledWith({
        data: {
          name: 'Crude Oil',
          quantity: 1500,
        },
      });

      expect(prismaMock.lot.create).toHaveBeenCalledTimes(1);
    });

    it('should propagate Prisma error', async () => {
      // Arrange
      const dto = {
        name: 'Crude Oil',
        quantity: 1500,
      };

      const prismaError = new Error(
        'Database connection failed',
      );

      prismaMock.lot.create.mockRejectedValue(
        prismaError,
      );

      // Act & Assert
      await expect(
        service.create(dto),
      ).rejects.toThrow('Database connection failed');
    });
  });
  describe('findOne', () => {
  it('should return a lot when it exists', async () => {
    const expectedLot = {
      id: 1,
      name: 'Crude Oil',
      quantity: 1500,
    };

    prismaMock.lot.findUnique.mockResolvedValue(
      expectedLot,
    );

    const result = await service.findOne(1);

    expect(result).toEqual(expectedLot);

    expect(prismaMock.lot.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw NotFoundException when lot does not exist', async () => {
    prismaMock.lot.findUnique.mockResolvedValue(null);

    await expect(
      service.findOne(999),
    ).rejects.toThrow('Lot with ID 999 not found');
  });
});

describe('update', () => {
  it('should update a lot successfully', async () => {
    // Arrange
    const dto = {
      name: 'Updated Crude Oil',
    };

    const existingLot = {
      id: 1,
      name: 'Crude Oil',
      quantity: 1500,
    };

    const updatedLot = {
      id: 1,
      name: 'Updated Crude Oil',
      quantity: 1500,
    };

    prismaMock.lot.findUnique.mockResolvedValue(existingLot);
    prismaMock.lot.update.mockResolvedValue(updatedLot);

    // Act
    const result = await service.update(1, dto);

    // Assert
    expect(result).toEqual(updatedLot);

    expect(prismaMock.lot.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
  });

  it('should throw BadRequestException for empty DTO', async () => {
    await expect(
      service.update(1, {}),
    ).rejects.toThrow('At least one field must be provided');

    expect(prismaMock.lot.update).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when lot does not exist', async () => {
    prismaMock.lot.findUnique.mockResolvedValue(null);

    await expect(
      service.update(999, { name: 'Updated Lot' }),
    ).rejects.toThrow('Lot with ID 999 not found');

    expect(prismaMock.lot.update).not.toHaveBeenCalled();
  });
});

describe('remove', () => {
  it('should delete a lot successfully', async () => {
    // Arrange
    const existingLot = {
      id: 1,
      name: 'Crude Oil',
      quantity: 1500,
    };

    prismaMock.lot.findUnique.mockResolvedValue(existingLot);
    prismaMock.lot.delete.mockResolvedValue(existingLot);

    // Act
    const result = await service.remove(1);

    // Assert
    expect(result).toEqual({
      message: 'Lot 1 successfully deleted',
    });

    expect(prismaMock.lot.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(prismaMock.lot.delete).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when lot does not exist', async () => {
    // Arrange
    prismaMock.lot.findUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(
      service.remove(999),
    ).rejects.toThrow('Lot with ID 999 not found');

    expect(prismaMock.lot.delete).not.toHaveBeenCalled();
  });

  it('should propagate Prisma delete error', async () => {
    // Arrange
    const existingLot = {
      id: 1,
      name: 'Crude Oil',
      quantity: 1500,
    };

    prismaMock.lot.findUnique.mockResolvedValue(existingLot);

    prismaMock.lot.delete.mockRejectedValue(
      new Error('Database delete failed'),
    );

    // Act & Assert
    await expect(
      service.remove(1),
    ).rejects.toThrow('Database delete failed');
  });
});

describe('disconnectOrganization', () => {
  it('should disconnect organization successfully', async () => {
    // Arrange
    const existingLot = {
      id: 1,
      name: 'Crude Oil',
      quantity: 1500,
      organizationId: 'org-123',
    };

    const updatedLot = {
      id: 1,
      name: 'Crude Oil',
      quantity: 1500,
      organizationId: null,
      organization: null,
    };

    prismaMock.lot.findUnique.mockResolvedValue(existingLot);
    prismaMock.lot.update.mockResolvedValue(updatedLot);

    // Act
    const result = await service.disconnectOrganization(1);

    // Assert
    expect(result).toEqual(updatedLot);

    expect(prismaMock.lot.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        organization: {
          disconnect: true,
        },
      },
      include: {
        organization: true,
      },
    });

    expect(prismaMock.lot.update).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when lot does not exist', async () => {
    // Arrange
    prismaMock.lot.findUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(
      service.disconnectOrganization(999),
    ).rejects.toThrow('Lot with ID 999 not found');

    expect(prismaMock.lot.update).not.toHaveBeenCalled();
  });
});



describe('findAll', () => {
  beforeEach(() => {
    prismaMock.lot.findMany.mockResolvedValue([]);
    prismaMock.lot.count.mockResolvedValue(0);
  });

  // 1. Default pagination
  it('should return paginated lots with default parameters', async () => {
    const lots = [
      { id: 1, name: 'Crude Oil', quantity: 1500 },
      { id: 2, name: 'Natural Gas', quantity: 2000 },
    ];

    prismaMock.lot.findMany.mockResolvedValue(lots);
    prismaMock.lot.count.mockResolvedValue(2);

    const query = new QueryLotsDto();

    const result = await service.findAll(query);

    expect(result.data).toEqual(lots);

    expect(result.meta).toEqual({
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    expect(prismaMock.lot.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });
  });

  // 2. Search and status filter
  it('should apply search and status filters', async () => {
    const query = Object.assign(new QueryLotsDto(), {
      search: 'Crude',
      status: 'DRAFT',
    });

    await service.findAll(query);

    expect(prismaMock.lot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'DRAFT',
          name: {
            contains: 'Crude',
            mode: 'insensitive',
          },
        },
      }),
    );

    expect(prismaMock.lot.count).toHaveBeenCalledWith({
      where: {
        status: 'DRAFT',
        name: {
          contains: 'Crude',
          mode: 'insensitive',
        },
      },
    });
  });

  // 3. Quantity range filter
  it('should apply minimum and maximum quantity filters', async () => {
    const query = Object.assign(new QueryLotsDto(), {
      minQuantity: 100,
      maxQuantity: 5000,
    });

    await service.findAll(query);

    expect(prismaMock.lot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          quantity: {
            gte: 100,
            lte: 5000,
          },
        },
      }),
    );
  });

  // 4. Minimum quantity only
  it('should apply minimum quantity filter only', async () => {
    const query = Object.assign(new QueryLotsDto(), {
      minQuantity: 100,
    });

    await service.findAll(query);

    expect(prismaMock.lot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          quantity: {
            gte: 100,
          },
        },
      }),
    );
  });

  // 5. Maximum quantity only
  it('should apply maximum quantity filter only', async () => {
    const query = Object.assign(new QueryLotsDto(), {
      maxQuantity: 5000,
    });

    await service.findAll(query);

    expect(prismaMock.lot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          quantity: {
            lte: 5000,
          },
        },
      }),
    );
  });

  // 6. Date range filter
  it('should apply date range filters', async () => {
    const dateFrom = '2026-01-01';
    const dateTo = '2026-12-31';

    const query = Object.assign(new QueryLotsDto(), {
      dateFrom,
      dateTo,
    });

    await service.findAll(query);

    expect(prismaMock.lot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
      }),
    );
  });

  // 7. Custom pagination and sorting
  it('should apply custom pagination and sorting', async () => {
    const query = Object.assign(new QueryLotsDto(), {
      page: 3,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc',
    });

    prismaMock.lot.count.mockResolvedValue(25);

    const result = await service.findAll(query);

    expect(prismaMock.lot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
        orderBy: {
          name: 'asc',
        },
      }),
    );

    expect(result.meta).toEqual({
      total: 25,
      page: 3,
      limit: 10,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });

  // 8. Pagination metadata
  it('should calculate pagination metadata correctly', async () => {
    const query = Object.assign(new QueryLotsDto(), {
      page: 2,
      limit: 10,
    });

    prismaMock.lot.count.mockResolvedValue(45);

    const result = await service.findAll(query);

    expect(result.meta.total).toBe(45);
    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalPages).toBe(5);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.hasPreviousPage).toBe(true);
  });

  // 9. Parallel database calls
  it('should execute findMany and count', async () => {
    const query = new QueryLotsDto();

    await service.findAll(query);

    expect(prismaMock.lot.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.lot.count).toHaveBeenCalledTimes(1);
  });

  // 10. findMany error
  it('should propagate findMany database error', async () => {
    const query = new QueryLotsDto();

    prismaMock.lot.findMany.mockRejectedValue(
      new Error('Database findMany failed'),
    );

    await expect(
      service.findAll(query),
    ).rejects.toThrow('Database findMany failed');
  });

  // 11. count error
  it('should propagate count database error', async () => {
    const query = new QueryLotsDto();

    prismaMock.lot.count.mockRejectedValue(
      new Error('Database count failed'),
    );

    await expect(
      service.findAll(query),
    ).rejects.toThrow('Database count failed');
  });
});




});
