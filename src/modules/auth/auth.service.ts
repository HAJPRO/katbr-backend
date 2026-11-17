
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { createHash, randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma.service.js';

import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ==========================================
  // TOKEN CONFIGURATION
  // ==========================================

  private get accessExpiresIn(): string {
    return this.configService.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
  }

  private get refreshExpiresIn(): string {
    return this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
  }

  private get refreshSecret(): string {
    return this.configService.getOrThrow<string>(
      'JWT_REFRESH_SECRET',
    );
  }

  // ==========================================
  // TOKEN HELPERS
  // ==========================================

  private hashRefreshToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  private getDurationMilliseconds(duration: string): number {
    const match = duration.match(/^(\d+)(s|m|h|d)$/);

    if (!match) {
      throw new Error(`Invalid token duration: ${duration}`);
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }

  // ==========================================
  // GENERATE TOKENS
  // ==========================================

  private async generateTokens(
    user: { id: string; email: string },
    familyId?: string,
  ) {
    const currentFamilyId = familyId ?? randomUUID();

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      familyId: currentFamilyId,
      jti: randomUUID(),
    };

    const accessToken = await this.jwtService.signAsync(
      accessPayload,
    );

    const refreshToken = await this.jwtService.signAsync(
      refreshPayload,
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    const tokenHash = this.hashRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() +
        this.getDurationMilliseconds(this.refreshExpiresIn),
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        familyId: currentFamilyId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessExpiresIn,
    };
  }

  // ==========================================
  // REGISTER
  // ==========================================

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    // Check existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    // Find default VIEWER role
    const defaultRole = await this.prisma.role.findUnique({
      where: {
        code: 'VIEWER',
      },
    });

    if (!defaultRole || !defaultRole.isActive) {
      throw new InternalServerErrorException(
        'Default VIEWER role is not configured or inactive',
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      // Create user and assign role atomically
      const user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            isActive: true,
          },
          select: {
            id: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        });

        await tx.userRoleAssignment.create({
          data: {
            userId: newUser.id,
            roleId: defaultRole.id,
          },
        });

        return newUser;
      });

      return {
        message: 'Registration successful',
        user: {
          ...user,
          roles: [
            {
              code: defaultRole.code,
              name: defaultRole.name,
            },
          ],
        },
      };
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Email is already registered',
        );
      }

      throw error;
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },

      include: {
        roleAssignments: {
          where: {
            role: {
              isActive: true,
            },
          },
          include: {
            role: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
    });

    return {
      ...tokens,

      user: {
        id: user.id,
        email: user.email,

        roles: user.roleAssignments.map(
          (assignment) => ({
            code: assignment.role.code,
            name: assignment.role.name,
          }),
        ),
      },
    };
  }

  // ==========================================
  // REFRESH TOKEN ROTATION
  // ==========================================

  async refresh(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(
          refreshToken,
          {
            secret: this.refreshSecret,
          },
        );
    } catch {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    if (
      !payload.sub ||
      !payload.familyId ||
      !payload.jti
    ) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    const storedToken =
      await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
          user: true,
        },
      });

    if (!storedToken) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    // Reuse detection
    if (storedToken.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: {
          familyId: storedToken.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException(
        'Refresh token reuse detected',
      );
    }

    const now = new Date();

    if (
      storedToken.expiresAt <= now ||
      !storedToken.user.isActive ||
      storedToken.userId !== payload.sub ||
      storedToken.familyId !== payload.familyId
    ) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const user = {
      id: storedToken.user.id,
      email: storedToken.user.email,
    };

    // Generate new token payloads
    const newRefreshPayload: RefreshTokenPayload = {
      sub: user.id,
      familyId: storedToken.familyId,
      jti: randomUUID(),
    };

    const newAccessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    const newRefreshToken = await this.jwtService.signAsync(
      newRefreshPayload,
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    const newTokenHash =
      this.hashRefreshToken(newRefreshToken);

    const newExpiresAt = new Date(
      Date.now() +
        this.getDurationMilliseconds(this.refreshExpiresIn),
    );

    // Atomic rotation
    const rotation = await this.prisma.$transaction(
      async (tx) => {
        const revoked = await tx.refreshToken.updateMany({
          where: {
            id: storedToken.id,
            revokedAt: null,
            expiresAt: { gt: now },
          },
          data: {
            revokedAt: now,
          },
        });

        if (revoked.count !== 1) {
          return false;
        }

        await tx.refreshToken.create({
          data: {
            userId: user.id,
            familyId: storedToken.familyId,
            tokenHash: newTokenHash,
            expiresAt: newExpiresAt,
          },
        });

        return true;
      },
    );

    if (!rotation) {
      await this.prisma.refreshToken.updateMany({
        where: {
          familyId: storedToken.familyId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException(
        'Refresh token already used',
      );
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessExpiresIn,
    };
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async logout(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(
          refreshToken,
          {
            secret: this.refreshSecret,
          },
        );
    } catch {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    const tokenHash = this.hashRefreshToken(refreshToken);

    const result = await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        userId: payload.sub,
        familyId: payload.familyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (result.count !== 1) {
      throw new UnauthorizedException(
        'Invalid or revoked refresh token',
      );
    }

    return {
      message: 'Logout successful',
    };
  }

  // ==========================================
  // VALIDATE USER
  // ==========================================

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },

      select: {
        id: true,
        email: true,
        isActive: true,

        roleAssignments: {
          where: {
            role: {
              isActive: true,
            },
          },
          select: {
            role: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'User is not authorized',
      );
    }

    return {
      id: user.id,
      email: user.email,

      roles: user.roleAssignments.map(
        (assignment) => assignment.role.code,
      ),
    };
  }
}
