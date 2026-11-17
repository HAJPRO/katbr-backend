import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { extname, resolve } from 'node:path';

import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uploadDir = resolve(
          config.get<string>('UPLOAD_DIR', 'uploads'),
        );

        mkdirSync(uploadDir, { recursive: true });

        return {
          storage: diskStorage({
            destination: uploadDir,

            filename: (req, file, callback) => {
              const extension = extname(file.originalname).toLowerCase();

              callback(null, `${randomUUID()}${extension}`);
            },
          }),

          limits: {
            fileSize: config.get<number>(
              'UPLOAD_MAX_FILE_SIZE',
              10485760,
            ),
          },

          fileFilter: (req, file, callback) => {
            const allowed = [
              {
                extension: '.pdf',
                mime: 'application/pdf',
              },
              {
                extension: '.doc',
                mime: 'application/msword',
              },
              {
                extension: '.docx',
                mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              },
            ];

            const extension = extname(file.originalname).toLowerCase();

            const valid = allowed.some(
              item =>
                item.extension === extension &&
                item.mime === file.mimetype,
            );

            if (!valid) {
              return callback(
                new Error('Unsupported file format'),
                false,
              );
            }

            callback(null, true);
          },
        };
      },
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}