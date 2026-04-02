import type { LoginInput, RegisterInput } from '@booking/shared';
import { JwtService } from '@nestjs/jwt';
import { type DrizzleClient } from '../database/drizzle.provider';
type AuthResponseData = {
    accessToken: string;
    refreshToken: string;
    userId: string;
};
export declare class AuthService {
    private readonly db;
    private readonly jwtService;
    constructor(db: DrizzleClient, jwtService: JwtService);
    register(input: RegisterInput): Promise<AuthResponseData>;
    login(input: LoginInput): Promise<AuthResponseData>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    private generateTokens;
}
export {};
