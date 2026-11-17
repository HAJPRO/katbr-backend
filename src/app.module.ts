
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';
import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';

import { LotsModule } from './modules/lots/lots.module.js';
import { PrismaModule } from './database/prisma.module.js';
import { envValidationSchema } from './config/env.validation.js';
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { BrokersModule } from './modules/brokers/brokers.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthorizationModule } from './modules/authorization/authorization.module.js';
import { CacheModule } from './modules/cache/cache.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),

    LotsModule,
    PrismaModule,
    OrganizationsModule,
    BrokersModule,
    DocumentsModule,
    AuthModule,
    AuthorizationModule,
    CacheModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
