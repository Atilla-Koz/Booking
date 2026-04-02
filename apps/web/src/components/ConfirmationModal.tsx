'use client';

import type { AvailableSession } from '@booking/shared';
import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

type BookingResult = { bookingId: string };

export const ConfirmationModal = ({
  isOpen,
  date,
  slot,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  date: string;
  slot: AvailableSession | null;
  onConfirm: () => Promise<BookingResult>;
  onCancel: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setBookingId(null);
      setLoading(false);
    }
  }, [isOpen, slot?.timeSlot]);

  if (!isOpen || !slot) {
    return null;
  }

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await onConfirm();
      setBookingId(result.bookingId);
    } catch (caught: unknown) {
      if (caught instanceof ApiError && caught.status === 409) {
        setError('This time slot was just booked. Please choose another slot.');
      } else if (caught instanceof Error) {
        setError(caught.message);
      } else {
        setError('Booking could not be created.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold">Booking Confirmation</h3>
        <p className="mb-1 text-sm text-gray-700">Date: {date}</p>
        <p className="mb-4 text-sm text-gray-700">
          Time: {slot.timeSlot} ({slot.durationMinutes} min)
        </p>

        {bookingId ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Booking successful. Booking ID: <strong>{bookingId}</strong>
          </div>
        ) : null}
        {error ? <ErrorMessage message={error} /> : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || bookingId !== null}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : null}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
