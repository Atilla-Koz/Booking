import { z } from 'zod';
export declare const BookingRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    date: z.ZodString;
    timeSlot: z.ZodString;
}, z.core.$strip>;
export declare const AvailableSessionSchema: z.ZodObject<{
    timeSlot: z.ZodString;
    startTime: z.ZodString;
    durationMinutes: z.ZodNumber;
    available: z.ZodBoolean;
}, z.core.$strip>;
export declare const AvailableSessionsResponseSchema: z.ZodArray<z.ZodObject<{
    timeSlot: z.ZodString;
    startTime: z.ZodString;
    durationMinutes: z.ZodNumber;
    available: z.ZodBoolean;
}, z.core.$strip>>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type AvailableSession = z.infer<typeof AvailableSessionSchema>;
//# sourceMappingURL=booking.schema.d.ts.map