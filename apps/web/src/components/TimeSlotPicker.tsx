'use client';

import type { AvailableSession } from '@booking/shared';
import { useEffect, useState } from 'react';
import { getAvailableSessions } from '@/lib/api/bookings';
import { ErrorMessage } from './ErrorMessage';

export const TimeSlotPicker = ({
  date,
  onSlotSelect,
}: {
  date: string;
  onSlotSelect: (slot: AvailableSession) => void;
}) => {
  const [slots, setSlots] = useState<AvailableSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAvailableSessions(date, timezone);
        if (isMounted) {
          setSlots(result);
        }
      } catch {
        if (isMounted) {
          setError('Time slots could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [date]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`slot-skeleton-${index}`}
            className="h-10 animate-pulse rounded-md bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
        There are no configured sessions for this date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => (
        <button
          key={slot.timeSlot}
          type="button"
          disabled={!slot.available}
          onClick={() => onSlotSelect(slot)}
          className={`rounded-md border px-3 py-2 text-sm ${
            slot.available
              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
              : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500'
          }`}
        >
          {slot.timeSlot}
        </button>
      ))}
    </div>
  );
};
