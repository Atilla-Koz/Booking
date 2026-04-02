'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAvailableSessions } from '@/lib/api/bookings';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

type DayStatus = 'available' | 'full' | 'empty';

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthDays = (monthDate: Date): Date[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, index) => new Date(year, month, index + 1));
};

export const CalendarView = ({
  onDateSelect,
}: {
  onDateSelect: (date: string) => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [statusMap, setStatusMap] = useState<Record<string, DayStatus>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const leadingBlanks = useMemo(
    () => Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }),
    [currentMonth],
  );

  useEffect(() => {
    let isMounted = true;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const loadMonth = async () => {
      setLoading(true);
      setError(null);
      try {
        const entries = await Promise.all(
          days.map(async (day) => {
            const key = toDateKey(day);
            const sessions = await getAvailableSessions(key, timezone);
            const hasAvailable = sessions.some((session) => session.available);
            const status: DayStatus = hasAvailable
              ? 'available'
              : sessions.length > 0
                ? 'full'
                : 'empty';
            return [key, status] as const;
          }),
        );
        if (isMounted) {
          setStatusMap(Object.fromEntries(entries));
        }
      } catch {
        if (isMounted) {
          setError('Calendar availability data could not be loaded.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMonth();
    return () => {
      isMounted = false;
    };
  }, [days]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-md border px-3 py-1 text-sm"
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
            )
          }
        >
          Previous
        </button>
        <h3 className="font-semibold">
          {currentMonth.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <button
          type="button"
          className="rounded-md border px-3 py-1 text-sm"
          onClick={() =>
            setCurrentMonth(
              new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
            )
          }
        >
          Next
        </button>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <LoadingSpinner /> Loading calendar...
        </div>
      )}
      {error && <ErrorMessage message={error} />}

      <div className="mb-2 grid grid-cols-7 text-center text-xs text-gray-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {leadingBlanks.map((_, index) => (
          <div key={`blank-${index}`} />
        ))}
        {days.map((day) => {
          const key = toDateKey(day);
          const isPast = day < today;
          const status = statusMap[key] ?? 'empty';
          const bgClass =
            status === 'available'
              ? 'bg-green-100 text-green-800'
              : status === 'full'
                ? 'bg-gray-200 text-gray-600'
                : 'bg-white text-gray-700';
          return (
            <button
              key={key}
              type="button"
              disabled={isPast}
              onClick={() => onDateSelect(key)}
              className={`rounded-md border px-2 py-2 text-sm transition ${bgClass} ${
                isPast ? 'cursor-not-allowed opacity-40' : 'hover:border-green-500'
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
