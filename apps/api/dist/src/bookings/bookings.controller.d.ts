import { type BookingRequest } from '@booking/shared';
import type { Request } from 'express';
import { z } from 'zod';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { BookingsService } from './bookings.service';
declare const AvailableQuerySchema: z.ZodObject<{
    date: z.ZodString;
    timezone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type AvailableQuery = z.infer<typeof AvailableQuerySchema>;
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    getAvailable(query: AvailableQuery): Promise<{
        data: Awaited<ReturnType<BookingsService['getAvailableSessions']>>;
        message: string;
        statusCode: number;
    }>;
    createBooking(body: BookingRequest, request: Request & {
        user: AuthenticatedUser;
    }): Promise<{
        data: Awaited<ReturnType<BookingsService['bookSession']>>;
        message: string;
        statusCode: number;
    }>;
}
export {};
