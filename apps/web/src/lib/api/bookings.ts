import {
  AvailableSessionsResponseSchema,
  BookingRequestSchema,
  type AvailableSession,
  type BookingRequest,
} from '@booking/shared';
import { apiRequest } from './client';

type BookingResponse = {
  bookingId: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  status: string;
};

export const getAvailableSessions = async (
  date: string,
  timezone?: string,
): Promise<AvailableSession[]> => {
  const params = new URLSearchParams({ date });
  if (timezone) {
    params.set('timezone', timezone);
  }
  const response = await apiRequest<AvailableSession[]>(
    `/bookings/available?${params.toString()}`,
    { method: 'GET' },
  );
  return AvailableSessionsResponseSchema.parse(response.data);
};

export const bookSession = async (data: BookingRequest): Promise<BookingResponse> => {
  const payload = BookingRequestSchema.parse(data);
  const response = await apiRequest<BookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
};
