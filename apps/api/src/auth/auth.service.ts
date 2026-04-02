import {
  ConflictException,
  Inject,
  InternalServerErrorException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoginInput, RegisterInput } from '@booking/shared';
import { compare, hash } from 'bcrypt';
import { eq } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import {
  DRIZZLE_TOKEN,
  type DrizzleClient,
} from '../database/drizzle.provider';
import { users } from '../database/schema';
import type { JwtPayload } from './jwt.strategy';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResponseData = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: DrizzleClient,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResponseData> {
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, input.email));

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    const passwordHash = await hash(input.password, 10);
    const [createdUser] = await this.db
      .insert(users)
      .values({
        email: input.email,
        name: input.name,
        passwordHash,
      })
      .returning({ id: users.id });

    const tokens = await this.generateTokens(createdUser.id, input.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: createdUser.id,
    };
  }

  async login(input: LoginInput): Promise<AuthResponseData> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, input.email));

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.id,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new InternalServerErrorException(
        'JWT refresh configuration is missing',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: refreshSecret,
        },
      );
      const accessSecret = process.env.JWT_SECRET;
      if (!accessSecret) {
        throw new InternalServerErrorException('JWT configuration is missing');
      }
      const accessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email },
        {
          secret: accessSecret,
          expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as StringValue,
        },
      );
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || !refreshSecret) {
      throw new InternalServerErrorException('JWT configuration is missing');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: jwtSecret,
          expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as StringValue,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: refreshSecret,
          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
            '7d') as StringValue,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
