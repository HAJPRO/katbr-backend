import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { access } from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service.js';

import { unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import type { Express } from 'express';

@Injectable()
export class DocumentsService {
  private readonly uploadDir: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.uploadDir = resolve(
      config.get<string>('UPLOAD_DIR', 'uploads'),
    );
  }

  async upload(file: Express.Multer.File) {
    try {
      const document = await this.prisma.document.create({
        data: {
          originalName: file.originalname,
          storageKey: file.filename,
          mimeType: file.mimetype,
          size: BigInt(file.size),
        },
      });

      return {
        id: document.id,
        originalName: document.originalName,
        mimeType: document.mimeType,
        size: document.size.toString(),
        status: document.status,
        createdAt: document.createdAt,
      };
    } catch (error) {
      // Database yozuvi muvaffaqiyatsiz bo'lsa,
      // diskda qolgan faylni tozalaymiz.
      try {
        await unlink(file.path);
      } catch {
        // Asosiy xatoni almashtirmaymiz.
      }

      throw error;
    }
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return {
      ...document,
      size: document.size.toString(),
    };
  }

  async getFilePath(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return {
      document,
      filePath: join(this.uploadDir, document.storageKey),
    };
  }

  async remove(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.prisma.document.delete({
      where: { id },
    });

    try {
      await unlink(join(this.uploadDir, document.storageKey));
    } catch {
      // DB yozuvi o'chgan, ammo diskda fayl qolgan bo'lishi mumkin.
      // Bunday holat production log va cleanup jarayonida qayta ishlanadi.
    }

    return {
      message: 'Document deleted successfully',
      id: document.id,
    };
  }
}