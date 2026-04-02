import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingRequestSchema, type BookingRequest } from '@booking/shared';
import type { Request } from 'express';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { BookingsService } from './bookings.service';

const AvailableQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  timezone: z.string().optional(),
});

type AvailableQuery = z.infer<typeof AvailableQuerySchema>;

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('available')
  async getAvailable(
    @Query(new ZodValidationPipe(AvailableQuerySchema)) query: AvailableQuery,
  ): Promise<{
    data: Awaited<ReturnType<BookingsService['getAvailableSessions']>>;
    message: string;
    statusCode: number;
  }> {
    const data = await this.bookingsService.getAvailableSessions(
      query.date,
      query.timezone,
    );
    return {
      data,
      message: 'Available sessions retrieved',
      statusCode: 200,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @Body(new ZodValidationPipe(BookingRequestSchema)) body: BookingRequest,
    @Req() request: Request & { user: AuthenticatedUser },
  ): Promise<{
    data: Awaited<ReturnType<BookingsService['bookSession']>>;
    message: string;
    statusCode: number;
  }> {
    const data = await this.bookingsService.bookSession(
      body,
      request.user.userId,
    );
    return {
      data,
      message: 'Booking confirmed',
      statusCode: 201,
    };
  }
}
