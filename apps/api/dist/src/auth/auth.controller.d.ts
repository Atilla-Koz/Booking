import { type LoginInput, type RegisterInput } from '@booking/shared';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterInput, response: Response): Promise<{
        data: {
            accessToken: string;
            userId: string;
        };
        message: string;
        statusCode: number;
    }>;
    login(body: LoginInput, response: Response): Promise<{
        data: {
            accessToken: string;
            userId: string;
        };
        message: string;
        statusCode: number;
    }>;
    refresh(request: Request, response: Response): Promise<{
        data: {
            accessToken: string;
        };
        message: string;
        statusCode: number;
    }>;
    logout(response: Response): {
        data: null;
        message: string;
        statusCode: number;
    };
    private setRefreshTokenCookie;
}
