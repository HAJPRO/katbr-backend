
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PermissionGuard } from '../../common/guards/permission.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { RbacTestController } from './rbac-test.controller.js';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],

  controllers: [
    AuthController,
    RbacTestController
    
  ],

  providers: [
    AuthService,
    JwtStrategy,
    PermissionGuard
  ],

  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule {}
