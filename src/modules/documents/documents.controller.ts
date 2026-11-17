
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  StreamableFile,
  Res,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { createReadStream } from 'node:fs';

import { DocumentsService } from './documents.service.js';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller({
  path: 'documents',
  version: '1',
})
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  // ==========================================
  // 1. Restricted Upload: PDF, DOC, DOCX
  // Maximum file size: 10 MB
  // ==========================================

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = [
          {
            extension: '.pdf',
            mimeType: 'application/pdf',
          },
          {
            extension: '.doc',
            mimeType: 'application/msword',
          },
          {
            extension: '.docx',
            mimeType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
        ];

        const extension = file.originalname
          .split('.')
          .pop()
          ?.toLowerCase();

        const isAllowed = allowedTypes.some(
          (item) =>
            item.extension === `.${extension}` &&
            item.mimeType === file.mimetype,
        );

        if (!isAllowed) {
          return callback(
            new BadRequestException(
              'Only PDF, DOC and DOCX files are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload document',
    description:
      'Upload PDF, DOC or DOCX document. Maximum file size: 10 MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Document uploaded successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file format or missing file',
  })
  @ApiResponse({
    status: HttpStatus.PAYLOAD_TOO_LARGE,
    description: 'File size exceeds 10 MB',
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.documentsService.upload(file);
  }

  // ==========================================
  // 2. Universal Upload: Different file formats
  // Maximum file size: 50 MB
  // ==========================================

  @Post('upload-any')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        // Format restriction is not applied here.
        callback(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload any file',
    description:
      'Upload files of different formats. Maximum file size: 50 MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'File uploaded successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'File is required',
  })
  @ApiResponse({
    status: HttpStatus.PAYLOAD_TOO_LARGE,
    description: 'File size exceeds 50 MB',
  })
  async uploadAny(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.documentsService.upload(file);
  }

  // ==========================================
  // 3. Get document metadata
  // ==========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get document metadata',
    description: 'Retrieve document information using its UUID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Document UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document metadata retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.documentsService.findOne(id);
  }

  // ==========================================
  // 4. Download document
  // ==========================================

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download document',
    description: 'Download a previously uploaded document.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Document UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document file downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document or stored file not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID',
  })
  async download(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { document, filePath } =
      await this.documentsService.getFilePath(id);

    const fileStream = createReadStream(filePath);

    response.set({
      'Content-Type': document.mimeType,
      'Content-Disposition':
        `attachment; filename*=UTF-8''${encodeURIComponent(document.originalName)}`,
      'Content-Length': document.size.toString(),
      'X-Content-Type-Options': 'nosniff',
    });

    return new StreamableFile(fileStream);
  }

  // ==========================================
  // 5. Delete document
  // ==========================================

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete document',
    description:
      'Delete document metadata and its stored file.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Document UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid UUID',
  })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.documentsService.remove(id);
  }
}
