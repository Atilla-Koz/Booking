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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt_1 = require("bcrypt");
const drizzle_orm_1 = require("drizzle-orm");
const jwt_1 = require("@nestjs/jwt");
const drizzle_provider_1 = require("../database/drizzle.provider");
const schema_1 = require("../database/schema");
let AuthService = class AuthService {
    db;
    jwtService;
    constructor(db, jwtService) {
        this.db = db;
        this.jwtService = jwtService;
    }
    async register(input) {
        const [existingUser] = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, input.email));
        if (existingUser) {
            throw new common_1.ConflictException('Email is already in use');
        }
        const passwordHash = await (0, bcrypt_1.hash)(input.password, 10);
        const [createdUser] = await this.db
            .insert(schema_1.users)
            .values({
            email: input.email,
            name: input.name,
            passwordHash,
        })
            .returning({ id: schema_1.users.id });
        const tokens = await this.generateTokens(createdUser.id, input.email);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            userId: createdUser.id,
        };
    }
    async login(input) {
        const [user] = await this.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, input.email));
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await (0, bcrypt_1.compare)(input.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const tokens = await this.generateTokens(user.id, user.email);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            userId: user.id,
        };
    }
    async refresh(refreshToken) {
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!refreshSecret) {
            throw new common_1.InternalServerErrorException('JWT refresh configuration is missing');
        }
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: refreshSecret,
            });
            const accessSecret = process.env.JWT_SECRET;
            if (!accessSecret) {
                throw new common_1.InternalServerErrorException('JWT configuration is missing');
            }
            const accessToken = await this.jwtService.signAsync({ sub: payload.sub, email: payload.email }, {
                secret: accessSecret,
                expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m'),
            });
            return { accessToken };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async generateTokens(userId, email) {
        const jwtSecret = process.env.JWT_SECRET;
        const refreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtSecret || !refreshSecret) {
            throw new common_1.InternalServerErrorException('JWT configuration is missing');
        }
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, email }, {
                secret: jwtSecret,
                expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m'),
            }),
            this.jwtService.signAsync({ sub: userId, email }, {
                secret: refreshSecret,
                expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
                    '7d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DRIZZLE_TOKEN)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map