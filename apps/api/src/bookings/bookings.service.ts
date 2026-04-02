import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BookingRequestSchema,
  SESSION_DURATION_MINUTES,
  type AvailableSession,
  type BookingRequest,
} from '@booking/shared';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { and, eq } from 'drizzle-orm';
import {
  DRIZZLE_TOKEN,
  type DrizzleClient,
} from '../database/drizzle.provider';
import { bookings, sessions } from '../database/schema';

type CreateBookingResult = {
  bookingId: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  status: string;
};

@Injectable()
export class BookingsService {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: DrizzleClient) {}

  async getAvailableSessions(
    date: string,
    timezone = 'UTC',
  ): Promise<AvailableSession[]> {
    const dayOfWeek = this.getDayOfWeekFromTimezone(date, timezone);

    const configuredSessions = await this.db
      .select({
        startTime: sessions.startTime,
        durationMinutes: sessions.durationMinutes,
      })
      .from(sessions)
      .where(
        and(eq(sessions.dayOfWeek, dayOfWeek), eq(sessions.isActive, true)),
      )
      .orderBy(sessions.startTime);

    const booked = await this.db
      .select({
        timeSlot: bookings.timeSlot,
      })
      .from(bookings)
      .where(and(eq(bookings.date, date), eq(bookings.status, 'confirmed')));

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

  async bookSession(
    data: BookingRequest,
    authenticatedUserId: string,
  ): Promise<CreateBookingResult> {
    const validated = BookingRequestSchema.parse(data);
    if (validated.userId !== authenticatedUserId) {
      throw new UnauthorizedException(
        'Cannot create booking for a different user',
      );
    }

    try {
      return await this.db.transaction(async (tx) => {
        const existing = await tx
          .select({ id: bookings.id })
          .from(bookings)
          .where(
            and(
              eq(bookings.date, validated.date),
              eq(bookings.timeSlot, validated.timeSlot),
              eq(bookings.status, 'confirmed'),
            ),
          )
          .for('update');

        if (existing.length > 0) {
          throw new ConflictException('This time slot is no longer available');
        }

        const [createdBooking] = await tx
          .insert(bookings)
          .values({
            userId: validated.userId,
            date: validated.date,
            timeSlot: validated.timeSlot,
            durationMinutes: SESSION_DURATION_MINUTES,
            status: 'confirmed',
          })
          .returning({
            bookingId: bookings.id,
            date: bookings.date,
            timeSlot: bookings.timeSlot,
            durationMinutes: bookings.durationMinutes,
            status: bookings.status,
          });

        return createdBooking;
      });
    } catch (error: unknown) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('This time slot is no longer available');
      }
      throw error;
    }
  }

  private getDayOfWeekFromTimezone(date: string, timezone: string): number {
    const utcDate = fromZonedTime(`${date}T00:00:00`, timezone);
    const isoDay = Number(formatInTimeZone(utcDate, timezone, 'i')); // 1(Mon)-7(Sun)
    return isoDay % 7; // convert Sunday(7) to 0
  }

  private isUniqueViolation(error: unknown): boolean {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    ) {
      return true;
    }
    return false;
  }
}
