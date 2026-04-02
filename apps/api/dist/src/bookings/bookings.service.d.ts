import { type AvailableSession, type BookingRequest } from '@booking/shared';
import { type DrizzleClient } from '../database/drizzle.provider';
type CreateBookingResult = {
    bookingId: string;
    date: string;
    timeSlot: string;
    durationMinutes: number;
    status: string;
};
export declare class BookingsService {
    private readonly db;
    constructor(db: DrizzleClient);
    getAvailableSessions(date: string, timezone?: string): Promise<AvailableSession[]>;
    bookSession(data: BookingRequest, authenticatedUserId: string): Promise<CreateBookingResult>;
    private getDayOfWeekFromTimezone;
    private isUniqueViolation;
}
export {};
