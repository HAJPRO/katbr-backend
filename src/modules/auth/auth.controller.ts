
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import type { Request } from 'express';

import { AuthService } from './auth.service.js';

import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ==========================================
  // REGISTER
  // ==========================================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ==========================================
  // LOGIN
  // ==========================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ==========================================
  // REFRESH
  // ==========================================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access and refresh tokens',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(
      dto.refreshToken,
    );
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout current session',
  })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(
      dto.refreshToken,
    );
  }

  // ==========================================
  // CURRENT USER
  // ==========================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated user profile',
  })
  getProfile(
    @Req() req: Request & {
      user: {
        id: string;
        email: string;
        role: string;
        isActive: boolean;
      };
    },
  ) {
    return req.user;
  }
}
