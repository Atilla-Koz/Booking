import { BookingWidget } from '@/components/BookingWidget';

export default function Home() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Session Booking</h1>
      <BookingWidget />
    </main>
  );
}
