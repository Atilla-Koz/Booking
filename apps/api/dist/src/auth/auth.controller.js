"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@booking/shared");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const auth_service_1 = require("./auth.service");
const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(body, response) {
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
    async login(body, response) {
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
    async refresh(request, response) {
        const refreshToken = request.cookies?.[REFRESH_COOKIE_NAME];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token is missing');
        }
        const data = await this.authService.refresh(refreshToken);
        this.setRefreshTokenCookie(response, refreshToken);
        return {
            data,
            message: 'Access token refreshed',
            statusCode: 200,
        };
    }
    logout(response) {
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
    setRefreshTokenCookie(response, refreshToken) {
        response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: REFRESH_COOKIE_MAX_AGE_MS,
            path: '/auth/refresh',
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.RegisterSchema))),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.LoginSchema))),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map