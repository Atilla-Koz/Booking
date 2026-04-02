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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@booking/shared");
const date_fns_tz_1 = require("date-fns-tz");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_provider_1 = require("../database/drizzle.provider");
const schema_1 = require("../database/schema");
let BookingsService = class BookingsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getAvailableSessions(date, timezone = 'UTC') {
        const dayOfWeek = this.getDayOfWeekFromTimezone(date, timezone);
        const configuredSessions = await this.db
            .select({
            startTime: schema_1.sessions.startTime,
            durationMinutes: schema_1.sessions.durationMinutes,
        })
            .from(schema_1.sessions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sessions.dayOfWeek, dayOfWeek), (0, drizzle_orm_1.eq)(schema_1.sessions.isActive, true)))
            .orderBy(schema_1.sessions.startTime);
        const booked = await this.db
            .select({
            timeSlot: schema_1.bookings.timeSlot,
        })
            .from(schema_1.bookings)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookings.date, date), (0, drizzle_orm_1.eq)(schema_1.bookings.status, 'confirmed')));
        const bookedSlots = new Set(booked.map((item) => item.timeSlot));
        return configuredSessions.map((session) => {
            const formatted = session.startTime.slice(0, 5);
            return {
                timeSlot: formatted,
                startTime: formatted,
                durationMinutes: session.durationMinutes,
                available: !bookedSlots.has(formatted),
            };
        });
    }
    async bookSession(data, authenticatedUserId) {
        const validated = shared_1.BookingRequestSchema.parse(data);
        if (validated.userId !== authenticatedUserId) {
            throw new common_1.UnauthorizedException('Cannot create booking for a different user');
        }
        try {
            return await this.db.transaction(async (tx) => {
                const existing = await tx
                    .select({ id: schema_1.bookings.id })
                    .from(schema_1.bookings)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.bookings.date, validated.date), (0, drizzle_orm_1.eq)(schema_1.bookings.timeSlot, validated.timeSlot), (0, drizzle_orm_1.eq)(schema_1.bookings.status, 'confirmed')))
                    .for('update');
                if (existing.length > 0) {
                    throw new common_1.ConflictException('This time slot is no longer available');
                }
                const [createdBooking] = await tx
                    .insert(schema_1.bookings)
                    .values({
                    userId: validated.userId,
                    date: validated.date,
                    timeSlot: validated.timeSlot,
                    durationMinutes: shared_1.SESSION_DURATION_MINUTES,
                    status: 'confirmed',
                })
                    .returning({
                    bookingId: schema_1.bookings.id,
                    date: schema_1.bookings.date,
                    timeSlot: schema_1.bookings.timeSlot,
                    durationMinutes: schema_1.bookings.durationMinutes,
                    status: schema_1.bookings.status,
                });
                return createdBooking;
            });
        }
        catch (error) {
            if (this.isUniqueViolation(error)) {
                throw new common_1.ConflictException('This time slot is no longer available');
            }
            throw error;
        }
    }
    getDayOfWeekFromTimezone(date, timezone) {
        const utcDate = (0, date_fns_tz_1.fromZonedTime)(`${date}T00:00:00`, timezone);
        const isoDay = Number((0, date_fns_tz_1.formatInTimeZone)(utcDate, timezone, 'i'));
        return isoDay % 7;
    }
    isUniqueViolation(error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === '23505') {
            return true;
        }
        return false;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DRIZZLE_TOKEN)),
    __metadata("design:paramtypes", [Object])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map