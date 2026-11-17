
import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global exception filter
  app.useGlobalFilters(
    new HttpExceptionFilter(),
  );

  // Global API prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    credentials: true,
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  // Swagger base configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('KATBR API')
    .setDescription(
      'KATBR Electronic Exchange Platform API Documentation',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Generate complete OpenAPI document
  const fullDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  // Swagger V1 document
  const v1Document = {
    ...fullDocument,
    info: {
      ...fullDocument.info,
      title: 'KATBR API - V1',
      version: '1.0',
      description: 'KATBR API Version 1 Documentation',
    },
    paths: Object.fromEntries(
      Object.entries(fullDocument.paths).filter(
        ([path]) => path.includes('/v1/'),
      ),
    ),
  };

  // Swagger V2 document
  const v2Document = {
    ...fullDocument,
    info: {
      ...fullDocument.info,
      title: 'KATBR API - V2',
      version: '2.0',
      description: 'KATBR API Version 2 Documentation',
    },
    paths: Object.fromEntries(
      Object.entries(fullDocument.paths).filter(
        ([path]) => path.includes('/v2/'),
      ),
    ),
  };

  // Register Swagger V1
  SwaggerModule.setup(
    'api/docs/v1',
    app,
    v1Document,
  );

  // Register Swagger V2
  SwaggerModule.setup(
    'api/docs/v2',
    app,
    v2Document,
  );

  // Start application
  const port = Number(
    configService.get<string>('PORT') ?? 3000,
  );

  await app.listen(port);

  console.log(`KATBR API running on port ${port}`);
  console.log(
    `Swagger V1: http://localhost:${port}/api/docs/v1`,
  );
  console.log(
    `Swagger V2: http://localhost:${port}/api/docs/v2`,
  );
}

await bootstrap();
