'use client';

import type { AvailableSession } from '@booking/shared';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { bookSession } from '@/lib/api/bookings';
import { CalendarView } from './CalendarView';
import { ConfirmationModal } from './ConfirmationModal';
import { TimeSlotPicker } from './TimeSlotPicker';

export const BookingWidget = () => {
  const { user, isLoadingAuth } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<AvailableSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoadingAuth) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Restoring your session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        You need to log in to create a booking.{' '}
        <Link href="/login" className="font-semibold underline">
          Log In
        </Link>
      </div>
    );
  }

  const handleConfirm = async (): Promise<{ bookingId: string }> => {
    if (!selectedDate || !selectedSlot) {
      throw new Error('Date and time selection are required.');
    }
    const created = await bookSession({
      userId: user.userId,
      date: selectedDate,
      timeSlot: selectedSlot.timeSlot,
    });
    return { bookingId: created.bookingId };
  };

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <CalendarView
        onDateSelect={(date) => {
          setSelectedDate(date);
          setSelectedSlot(null);
        }}
      />
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Time Slot Selection</h2>
        {selectedDate ? (
          <TimeSlotPicker
            date={selectedDate}
            onSlotSelect={(slot) => {
              setSelectedSlot(slot);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <p className="text-sm text-gray-500">Please select a date from the calendar.</p>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        date={selectedDate}
        slot={selectedSlot}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </section>
  );
};
