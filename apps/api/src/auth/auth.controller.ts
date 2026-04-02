import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput,
} from '@booking/shared';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) body: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{
    data: { accessToken: string; userId: string };
    message: string;
    statusCode: number;
  }> {
    const data = await this.authService.register(body);
    this.setRefreshTokenCookie(response, data.refreshToken);

    return {
      data: {
        accessToken: data.accessToken,
        userId: data.userId,
      },
      message: 'User registered successfully',
      statusCode: 201,
    };
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: LoginInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{
    data: { accessToken: string; userId: string };
    message: string;
    statusCode: number;
  }> {
    const data = await this.authService.login(body);
    this.setRefreshTokenCookie(response, data.refreshToken);

    return {
      data: {
        accessToken: data.accessToken,
        userId: data.userId,
      },
      message: 'Login successful',
      statusCode: 200,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{
    data: { accessToken: string };
    message: string;
    statusCode: number;
  }> {
    const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME] as
      | string
      | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const data = await this.authService.refresh(refreshToken);
    this.setRefreshTokenCookie(response, refreshToken);

    return {
      data,
      message: 'Access token refreshed',
      statusCode: 200,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): {
    data: null;
    message: string;
    statusCode: number;
  } {
    response.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
    });

    return {
      data: null,
      message: 'Logged out successfully',
      statusCode: 200,
    };
  }

  private setRefreshTokenCookie(
    response: Response,
    refreshToken: string,
  ): void {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: '/auth/refresh',
    });
  }
}
