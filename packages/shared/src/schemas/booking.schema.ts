import { z } from 'zod';

export const BookingRequestSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'Time slot must be HH:MM'),
});

export const AvailableSessionSchema = z.object({
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'Time slot must be HH:MM'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:MM'),
  durationMinutes: z.number().int().positive(),
  available: z.boolean(),
});

export const AvailableSessionsResponseSchema = z.array(AvailableSessionSchema);

export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type AvailableSession = z.infer<typeof AvailableSessionSchema>;
