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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@booking/shared");
const zod_1 = require("zod");
const zod_validation_pipe_1 = require("../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const bookings_service_1 = require("./bookings.service");
const AvailableQuerySchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    timezone: zod_1.z.string().optional(),
});
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    async getAvailable(query) {
        const data = await this.bookingsService.getAvailableSessions(query.date, query.timezone);
        return {
            data,
            message: 'Available sessions retrieved',
            statusCode: 200,
        };
    }
    async createBooking(body, request) {
        const data = await this.bookingsService.bookSession(body, request.user.userId);
        return {
            data,
            message: 'Booking confirmed',
            statusCode: 201,
        };
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(AvailableQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "getAvailable", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.BookingRequestSchema))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BookingsController.prototype, "createBooking", null);
exports.BookingsController = BookingsController = __decorate([
    (0, common_1.Controller)('bookings'),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map